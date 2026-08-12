# Persistencia Editorial - LICEU 6.0

## Visao geral
O módulo editorial opera com dois modos de persistência:

- `postgres`: quando `POSTGRES_URL` ou `DATABASE_URL` está definido.
- `memory`: fallback automático quando não há conexão configurada.

O modo ativo aparece em `GET /api/editorial/resumo` no campo `storage_mode`.

## Variáveis de ambiente
No backend, defina uma das variáveis:

```bash
POSTGRES_URL=postgres://usuario:senha@localhost:5432/game_mkt
# ou
DATABASE_URL=postgres://usuario:senha@localhost:5432/game_mkt
```

## Tabelas criadas automaticamente
Ao iniciar o serviço com Postgres, o sistema cria:

- `editorial_inteligencias`
- `editorial_obras`
- `editorial_trilhas`

Cada entidade é armazenada em `JSONB` com colunas de indexação operacional (`status_pipeline`, `categoria`, `nivel`, etc).

## Fluxo recomendado de uso
1. Subir banco PostgreSQL.
2. Configurar `POSTGRES_URL`.
3. Iniciar backend (`npm run dev`).
4. Executar fluxo por API ou pelo painel frontend.
5. Confirmar `storage_mode: "postgres"` em `/api/editorial/resumo`.

## Teste rápido
```bash
curl -s http://localhost:3001/api/editorial/resumo | jq
```
