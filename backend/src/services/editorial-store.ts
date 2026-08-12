import { Pool } from 'pg'
import {
  InteligenciaEditorial,
  NivelComplexidade,
  ObraEditorial,
  PipelineEditorialStatus,
  CategoriaEducacional,
  TrilhaEducacional,
} from '../types/editorial'

interface FiltroObra {
  status?: PipelineEditorialStatus
  categoria?: CategoriaEducacional
  nivel?: NivelComplexidade
}

interface ResumoEditorial {
  storage_mode: 'memory' | 'postgres'
  total_inteligencias: number
  total_obras: number
  total_trilhas: number
  status_pipeline: Record<PipelineEditorialStatus, number>
  colaboradores_globais: {
    india: number
    china: number
    mundo_arabe: number
  }
}

export interface EditorialStore {
  salvarInteligencia(inteligencia: InteligenciaEditorial): Promise<void>
  salvarObra(obra: ObraEditorial): Promise<void>
  listarObras(filtro?: FiltroObra): Promise<ObraEditorial[]>
  buscarObra(obraId: string): Promise<ObraEditorial | undefined>
  salvarTrilha(trilha: TrilhaEducacional): Promise<void>
  resumo(): Promise<ResumoEditorial>
}

function reviveDates<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => reviveDates(item)) as T
  }

  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
      if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(raw)) {
        out[key] = new Date(raw)
      } else {
        out[key] = reviveDates(raw)
      }
    }
    return out as T
  }

  return value
}

export class MemoryEditorialStore implements EditorialStore {
  private inteligencias: InteligenciaEditorial[] = []
  private obras: ObraEditorial[] = []
  private trilhas: TrilhaEducacional[] = []

  async salvarInteligencia(inteligencia: InteligenciaEditorial): Promise<void> {
    this.inteligencias.push(inteligencia)
  }

  async salvarObra(obra: ObraEditorial): Promise<void> {
    const idx = this.obras.findIndex((item) => item.id === obra.id)
    if (idx >= 0) {
      this.obras[idx] = obra
      return
    }
    this.obras.push(obra)
  }

  async listarObras(filtro: FiltroObra = {}): Promise<ObraEditorial[]> {
    return this.obras.filter((obra) => {
      if (filtro.status && obra.status_pipeline !== filtro.status) return false
      if (filtro.categoria && obra.categoria !== filtro.categoria) return false
      if (filtro.nivel && obra.nivel !== filtro.nivel) return false
      return true
    })
  }

  async buscarObra(obraId: string): Promise<ObraEditorial | undefined> {
    return this.obras.find((obra) => obra.id === obraId)
  }

  async salvarTrilha(trilha: TrilhaEducacional): Promise<void> {
    this.trilhas.push(trilha)
  }

  async resumo(): Promise<ResumoEditorial> {
    return {
      storage_mode: 'memory',
      total_inteligencias: this.inteligencias.length,
      total_obras: this.obras.length,
      total_trilhas: this.trilhas.length,
      status_pipeline: {
        proposta: this.obras.filter((obra) => obra.status_pipeline === 'proposta').length,
        rascunho: this.obras.filter((obra) => obra.status_pipeline === 'rascunho').length,
        revisao_tecnica: this.obras.filter((obra) => obra.status_pipeline === 'revisao_tecnica').length,
        revisao_pedagogica: this.obras.filter((obra) => obra.status_pipeline === 'revisao_pedagogica').length,
        diagramacao: this.obras.filter((obra) => obra.status_pipeline === 'diagramacao').length,
        publicacao: this.obras.filter((obra) => obra.status_pipeline === 'publicacao').length,
      },
      colaboradores_globais: {
        india: this.obras.filter((obra) => obra.colaboradores_globais.includes('india')).length,
        china: this.obras.filter((obra) => obra.colaboradores_globais.includes('china')).length,
        mundo_arabe: this.obras.filter((obra) => obra.colaboradores_globais.includes('mundo_arabe')).length,
      },
    }
  }
}

export class PostgresEditorialStore implements EditorialStore {
  private initPromise: Promise<void>

  constructor(private readonly pool: Pool) {
    this.initPromise = this.ensureSchema()
  }

  private async ensureSchema(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS editorial_inteligencias (
        id TEXT PRIMARY KEY,
        empresa_id TEXT NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS editorial_obras (
        id TEXT PRIMARY KEY,
        empresa_id TEXT NOT NULL,
        status_pipeline TEXT NOT NULL,
        categoria TEXT NOT NULL,
        nivel TEXT NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS editorial_trilhas (
        id TEXT PRIMARY KEY,
        categoria TEXT NOT NULL,
        nivel TEXT NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
  }

  private async ready(): Promise<void> {
    await this.initPromise
  }

  async salvarInteligencia(inteligencia: InteligenciaEditorial): Promise<void> {
    await this.ready()
    await this.pool.query(
      `
        INSERT INTO editorial_inteligencias (id, empresa_id, data)
        VALUES ($1, $2, $3::jsonb)
        ON CONFLICT (id)
        DO UPDATE SET data = EXCLUDED.data
      `,
      [inteligencia.id, inteligencia.empresa_id, JSON.stringify(inteligencia)]
    )
  }

  async salvarObra(obra: ObraEditorial): Promise<void> {
    await this.ready()
    await this.pool.query(
      `
        INSERT INTO editorial_obras (id, empresa_id, status_pipeline, categoria, nivel, data)
        VALUES ($1, $2, $3, $4, $5, $6::jsonb)
        ON CONFLICT (id)
        DO UPDATE SET
          status_pipeline = EXCLUDED.status_pipeline,
          categoria = EXCLUDED.categoria,
          nivel = EXCLUDED.nivel,
          data = EXCLUDED.data,
          updated_at = NOW()
      `,
      [
        obra.id,
        obra.empresa_id,
        obra.status_pipeline,
        obra.categoria,
        obra.nivel,
        JSON.stringify(obra),
      ]
    )
  }

  async listarObras(filtro: FiltroObra = {}): Promise<ObraEditorial[]> {
    await this.ready()

    const conditions: string[] = []
    const values: unknown[] = []

    if (filtro.status) {
      values.push(filtro.status)
      conditions.push(`status_pipeline = $${values.length}`)
    }
    if (filtro.categoria) {
      values.push(filtro.categoria)
      conditions.push(`categoria = $${values.length}`)
    }
    if (filtro.nivel) {
      values.push(filtro.nivel)
      conditions.push(`nivel = $${values.length}`)
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
    const query = `SELECT data FROM editorial_obras ${whereClause} ORDER BY created_at DESC`

    const result = await this.pool.query<{ data: ObraEditorial }>(query, values)
    return result.rows.map((row) => reviveDates(row.data))
  }

  async buscarObra(obraId: string): Promise<ObraEditorial | undefined> {
    await this.ready()
    const result = await this.pool.query<{ data: ObraEditorial }>(
      'SELECT data FROM editorial_obras WHERE id = $1',
      [obraId]
    )

    if (result.rowCount === 0) return undefined
    return reviveDates(result.rows[0].data)
  }

  async salvarTrilha(trilha: TrilhaEducacional): Promise<void> {
    await this.ready()
    await this.pool.query(
      `
        INSERT INTO editorial_trilhas (id, categoria, nivel, data)
        VALUES ($1, $2, $3, $4::jsonb)
        ON CONFLICT (id)
        DO UPDATE SET data = EXCLUDED.data
      `,
      [trilha.id, trilha.categoria, trilha.nivel, JSON.stringify(trilha)]
    )
  }

  async resumo(): Promise<ResumoEditorial> {
    await this.ready()

    const [inteligencias, obras, trilhas] = await Promise.all([
      this.pool.query<{ total: string }>('SELECT COUNT(*)::text AS total FROM editorial_inteligencias'),
      this.pool.query<{ total: string }>('SELECT COUNT(*)::text AS total FROM editorial_obras'),
      this.pool.query<{ total: string }>('SELECT COUNT(*)::text AS total FROM editorial_trilhas'),
    ])

    const obrasRows = await this.pool.query<{ data: ObraEditorial }>('SELECT data FROM editorial_obras')
    const obrasPayload = obrasRows.rows.map((row) => reviveDates(row.data))

    return {
      storage_mode: 'postgres',
      total_inteligencias: Number(inteligencias.rows[0].total),
      total_obras: Number(obras.rows[0].total),
      total_trilhas: Number(trilhas.rows[0].total),
      status_pipeline: {
        proposta: obrasPayload.filter((obra) => obra.status_pipeline === 'proposta').length,
        rascunho: obrasPayload.filter((obra) => obra.status_pipeline === 'rascunho').length,
        revisao_tecnica: obrasPayload.filter((obra) => obra.status_pipeline === 'revisao_tecnica').length,
        revisao_pedagogica: obrasPayload.filter((obra) => obra.status_pipeline === 'revisao_pedagogica').length,
        diagramacao: obrasPayload.filter((obra) => obra.status_pipeline === 'diagramacao').length,
        publicacao: obrasPayload.filter((obra) => obra.status_pipeline === 'publicacao').length,
      },
      colaboradores_globais: {
        india: obrasPayload.filter((obra) => obra.colaboradores_globais.includes('india')).length,
        china: obrasPayload.filter((obra) => obra.colaboradores_globais.includes('china')).length,
        mundo_arabe: obrasPayload.filter((obra) => obra.colaboradores_globais.includes('mundo_arabe')).length,
      },
    }
  }
}

export function createEditorialStore(): EditorialStore {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL

  if (!connectionString) {
    return new MemoryEditorialStore()
  }

  const pool = new Pool({ connectionString })
  return new PostgresEditorialStore(pool)
}