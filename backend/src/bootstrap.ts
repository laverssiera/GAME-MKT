import dotenv from 'dotenv'
import { federation } from './federation/federation'
import { startObservabilityRuntime } from './observability/otel'

dotenv.config()

async function bootstrap() {
  startObservabilityRuntime()

  const federationEnabled = process.env.FEDERATION_ENABLED === 'true'
  if (federationEnabled) {
    try {
      await federation.connect()
    } catch (error) {
      console.error('Falha ao conectar na Federacao LICEU:', error)
    }
  }

  console.log('GAME MKT FEDERATION READY')

  await import('./index')
}

void bootstrap()
