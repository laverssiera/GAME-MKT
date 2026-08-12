import { z, ZodTypeAny } from 'zod'

type RegistryEntry = {
  version: string
  schema: ZodTypeAny
}

const registry = new Map<string, RegistryEntry>()

export function registerSchema(subject: string, version: string, schema: ZodTypeAny) {
  registry.set(subject, { version, schema })
}

export function getSchema(subject: string): RegistryEntry | undefined {
  return registry.get(subject)
}

export function validateSchema(subject: string, payload: unknown) {
  const found = registry.get(subject)
  if (!found) {
    return {
      success: false,
      error: `Schema nao encontrado para subject: ${subject}`,
    }
  }

  const parsed = found.schema.safeParse(payload)
  return parsed.success
    ? {
        success: true,
        data: parsed.data,
      }
    : {
        success: false,
        error: parsed.error.issues,
      }
}

registerSchema(
  'liceu.revenue.lead.created',
  '1.0.0',
  z.object({
    lead_id: z.string(),
    source: z.string().optional(),
  }),
)
