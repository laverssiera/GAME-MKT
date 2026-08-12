#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR"
HEALTH_URL="http://localhost:3001/health"
PUBLISH_URL="http://localhost:3001/api/game-mkt/federation/publish"
SUBJECT="liceu.revenue.lead.created"
NATS_CONTAINER="game-mkt-nats"

BACKEND_STARTED_BY_SCRIPT=0
BACKEND_PID=""
BACKEND_LOG=""
SUB_LOG=""
SUB_PID=""

cleanup() {
  if [[ -n "$SUB_LOG" && -f "$SUB_LOG" ]]; then
    rm -f "$SUB_LOG"
  fi

  if [[ "$BACKEND_STARTED_BY_SCRIPT" -eq 1 && -n "$BACKEND_PID" ]]; then
    kill "$BACKEND_PID" >/dev/null 2>&1 || true
  fi

  if [[ -n "$BACKEND_LOG" && -f "$BACKEND_LOG" ]]; then
    rm -f "$BACKEND_LOG"
  fi
}
trap cleanup EXIT

ensure_nats() {
  if docker ps --format '{{.Names}}' | grep -qx "$NATS_CONTAINER"; then
    echo "[smoke] NATS ja esta em execucao"
    return
  fi

  if docker ps -a --format '{{.Names}}' | grep -qx "$NATS_CONTAINER"; then
    echo "[smoke] Iniciando container NATS existente"
    docker start "$NATS_CONTAINER" >/dev/null
    return
  fi

  echo "[smoke] Criando container NATS"
  docker run -d --name "$NATS_CONTAINER" -p 4222:4222 nats:2-alpine >/dev/null
}

ensure_backend() {
  if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
    echo "[smoke] Backend ja esta em execucao"
    return
  fi

  echo "[smoke] Iniciando backend"
  BACKEND_STARTED_BY_SCRIPT=1
  BACKEND_LOG="$(mktemp)"
  (
    cd "$BACKEND_DIR"
    npm run dev
  ) >"$BACKEND_LOG" 2>&1 &
  BACKEND_PID=$!

  for _ in $(seq 1 40); do
    if curl -fsS "$HEALTH_URL" >/dev/null 2>&1; then
      echo "[smoke] Backend iniciou"
      return
    fi
    sleep 1
  done

  echo "[smoke] Falha ao iniciar backend. Log:"
  cat "$BACKEND_LOG"
  exit 1
}

run_subscriber() {
  local message_id="$1"
  SUB_LOG="$(mktemp)"

  (
    cd "$BACKEND_DIR"
    node - "$SUBJECT" "$message_id" <<'NODE'
const { connect, StringCodec } = require('nats')

async function main() {
  const subject = process.argv[2]
  const targetLeadId = process.argv[3]
  const sc = StringCodec()

  const nc = await connect({ servers: process.env.NATS_SERVERS || 'nats://localhost:4222' })
  const sub = nc.subscribe(subject)

  console.log('sub-ready')

  const timeout = setTimeout(async () => {
    console.error('timeout')
    await nc.close()
    process.exit(1)
  }, 20000)

  for await (const msg of sub) {
    const decoded = sc.decode(msg.data)

    try {
      const parsed = JSON.parse(decoded)
      if (parsed.lead_id === targetLeadId) {
        clearTimeout(timeout)
        console.log('received=' + decoded)
        await nc.close()
        process.exit(0)
      }
    } catch (_) {
      // ignora payload invalido para o teste atual
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
NODE
  ) >"$SUB_LOG" 2>&1 &

  SUB_PID=$!

  for _ in $(seq 1 40); do
    if grep -q 'sub-ready' "$SUB_LOG"; then
      return
    fi
    sleep 0.25
  done

  echo "[smoke] Subscriber nao ficou pronto. Log:"
  cat "$SUB_LOG"
  kill "$SUB_PID" >/dev/null 2>&1 || true
  exit 1
}

publish_event() {
  local message_id="$1"

  local response
  response="$(curl -sS -X POST "$PUBLISH_URL" \
    -H 'Content-Type: application/json' \
    -d "{\"subject\":\"$SUBJECT\",\"payload\":{\"lead_id\":\"$message_id\",\"source\":\"smoke-test\"}}")"

  if [[ "$response" != *'"published":true'* ]]; then
    echo "[smoke] Publish nao retornou sucesso: $response"
    exit 1
  fi

  echo "[smoke] Publish ok: $response"
}

main() {
  local message_id="ld-smoke-$(date +%s)"

  ensure_nats
  ensure_backend

  run_subscriber "$message_id"

  publish_event "$message_id"

  if ! wait "$SUB_PID"; then
    echo "[smoke] Subscriber falhou. Log:"
    cat "$SUB_LOG"
    exit 1
  fi

  if ! grep -Fq "received={" "$SUB_LOG"; then
    echo "[smoke] Mensagem nao foi recebida pelo subscriber. Log:"
    cat "$SUB_LOG"
    exit 1
  fi

  echo "[smoke] E2E federado validado com sucesso"
  cat "$SUB_LOG"
}

main
