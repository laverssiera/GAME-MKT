import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'

let started = false

export function startObservabilityRuntime() {
  if (started) {
    return
  }

  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318'
  const traceExporter = new OTLPTraceExporter({
    url: `${endpoint}/v1/traces`,
  })

  const sdk = new NodeSDK({
    traceExporter,
    instrumentations: [getNodeAutoInstrumentations()],
  })

  sdk.start()
  started = true

  console.log('GAME MKT observability runtime iniciado')
}
