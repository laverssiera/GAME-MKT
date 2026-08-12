import { connect, NatsConnection } from 'nats'

export class FederationRuntime {
  private nc: NatsConnection | null = null

  async connect() {
    if (this.nc) {
      return this.nc
    }

    this.nc = await connect({
      servers: process.env.NATS_SERVERS,
    })

    console.log('GAME MKT conectado a Federacao LICEU')
    return this.nc
  }

  async publish(subject: string, payload: unknown) {
    if (!this.nc) {
      await this.connect()
    }

    this.nc?.publish(subject, Buffer.from(JSON.stringify(payload)))
  }
}

export const federation = new FederationRuntime()
