<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  useEditorialApi,
  type BibliotecaItemUI,
  type ObraEditorialUI,
  type PipelineStatus,
} from '../composables/useEditorialApi'

const api = useEditorialApi()
const obras = ref<ObraEditorialUI[]>([])
const resumo = ref<any>(null)
const analytics = ref<any>(null)
const biblioteca = ref<BibliotecaItemUI[]>([])
const info = ref('')

const form = ref({
  titulo: 'Manual Integrado de Gestão de Obras com IA',
  descricao: 'Conteúdo estruturado para engenharia, construção civil e capacitação técnica.',
  categoria: 'gestao_de_obras',
  nivel: 'intermediario',
})

const pipelineOrder: PipelineStatus[] = [
  'proposta',
  'rascunho',
  'revisao_tecnica',
  'revisao_pedagogica',
  'diagramacao',
  'publicacao',
]

const statusLabel: Record<PipelineStatus, string> = {
  proposta: 'Proposta',
  rascunho: 'Rascunho',
  revisao_tecnica: 'Revisão técnica',
  revisao_pedagogica: 'Revisão pedagógica',
  diagramacao: 'Diagramação',
  publicacao: 'Publicação',
}

const load = async () => {
  obras.value = await api.listarObras()
  resumo.value = await api.resumo()

  const bibliotecaData = await api.bibliotecaDigital()
  biblioteca.value = bibliotecaData.itens
}

const criarInteligencia = async () => {
  try {
    await api.capturarInteligencia()
    info.value = 'Inteligência operacional capturada com sucesso.'
    resumo.value = await api.resumo()
  } catch (err) {
    info.value = String(err)
  }
}

const criarObra = async () => {
  try {
    await api.criarObra(form.value)
    info.value = 'Obra criada no pipeline editorial.'
    await load()
  } catch (err) {
    info.value = String(err)
  }
}

const avancar = async (obra: ObraEditorialUI) => {
  try {
    const idx = pipelineOrder.indexOf(obra.status_pipeline)
    const next = pipelineOrder[Math.min(pipelineOrder.length - 1, idx + 1)]

    if (next === obra.status_pipeline) {
      info.value = 'A obra já está na etapa final do pipeline.'
      return
    }

    await api.atualizarPipeline(obra.id, next)
    info.value = `Obra ${obra.titulo} avançou para ${statusLabel[next]}.`
    await load()
  } catch (err) {
    info.value = String(err)
  }
}

const estruturar = async (obra: ObraEditorialUI) => {
  try {
    await api.estruturarIA(obra.id)
    info.value = `IA John estruturou capítulos para ${obra.titulo}.`
    await load()
  } catch (err) {
    info.value = String(err)
  }
}

const publicar = async (obra: ObraEditorialUI) => {
  try {
    await api.publicar(obra.id)
    info.value = `Obra publicada: ${obra.titulo}.`
    await load()
  } catch (err) {
    info.value = String(err)
  }
}

const exportar = async (obra: ObraEditorialUI) => {
  try {
    const data = await api.exportarObra(obra.id)
    info.value = `Distribuicao gerada (${data.artefatos.length} formatos) para ${obra.titulo}.`
    await load()
  } catch (err) {
    info.value = String(err)
  }
}

const carregarAnalytics = async () => {
  try {
    analytics.value = await api.analyticsAprendizado()
    info.value = 'Analytics educacional atualizado para a Academia do Saber.'
  } catch (err) {
    info.value = String(err)
  }
}

onMounted(load)
</script>

<template>
  <section id="editorial-dashboard" class="rounded-3xl glass p-6 sm:p-8">
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-xs font-semibold tracking-[0.14em] text-liceu-secondary">EDITORA LICEU 6.0</p>
        <h2 class="mt-2 text-3xl font-bold text-liceu-primary">Painel Editorial Operacional</h2>
      </div>
      <p class="max-w-xl text-sm text-liceu-primary/70">
        Da inteligência de campo ao produto educacional: livros, apostilas, cursos e trilhas com IA John.
      </p>
    </div>

    <div class="grid gap-4 lg:grid-cols-[1fr,1.4fr]">
      <aside class="space-y-4 rounded-2xl border border-liceu-secondary/15 bg-white p-4">
        <h3 class="text-lg font-semibold">Ações rápidas</h3>

        <button
          class="w-full rounded-xl bg-liceu-secondary px-4 py-2 text-sm font-semibold text-white"
          @click="criarInteligencia"
        >
          Capturar Inteligência GAME MKT
        </button>

        <div class="space-y-2">
          <input v-model="form.titulo" class="w-full rounded-lg border border-liceu-secondary/20 px-3 py-2 text-sm" />
          <textarea
            v-model="form.descricao"
            class="w-full rounded-lg border border-liceu-secondary/20 px-3 py-2 text-sm"
            rows="3"
          ></textarea>
          <div class="grid grid-cols-2 gap-2">
            <select v-model="form.categoria" class="rounded-lg border border-liceu-secondary/20 px-3 py-2 text-sm">
              <option value="ensino_fundamental">Ensino fundamental</option>
              <option value="ensino_medio">Ensino médio</option>
              <option value="tecnico_construcao_civil">Técnico construção civil</option>
              <option value="capacitacao_profissional">Capacitação profissional</option>
              <option value="engenharia">Engenharia</option>
              <option value="gestao_de_obras">Gestão de obras</option>
            </select>
            <select v-model="form.nivel" class="rounded-lg border border-liceu-secondary/20 px-3 py-2 text-sm">
              <option value="iniciante">Iniciante</option>
              <option value="intermediario">Intermediário</option>
              <option value="avancado">Avançado</option>
            </select>
          </div>
        </div>

        <button
          class="w-full rounded-xl bg-liceu-accent px-4 py-2 text-sm font-semibold text-white"
          @click="criarObra"
        >
          Criar Obra no Pipeline
        </button>

        <p class="rounded-lg bg-liceu-surface px-3 py-2 text-xs text-liceu-primary/80">
          {{ info || api.error || 'Aguardando comando editorial...' }}
        </p>
      </aside>

      <div class="space-y-4">
        <article class="grid gap-3 rounded-2xl border border-liceu-secondary/15 bg-white p-4 sm:grid-cols-4">
          <div>
            <p class="text-xs text-liceu-primary/60">Inteligências</p>
            <p class="text-2xl font-bold">{{ resumo?.total_inteligencias ?? '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-liceu-primary/60">Obras</p>
            <p class="text-2xl font-bold">{{ resumo?.total_obras ?? '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-liceu-primary/60">Trilhas</p>
            <p class="text-2xl font-bold">{{ resumo?.total_trilhas ?? '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-liceu-primary/60">Ciclo</p>
            <p class="text-sm font-semibold">{{ resumo?.ciclo || 'OPERAR -> ENSINAR' }}</p>
          </div>
        </article>

        <article class="grid gap-3 rounded-2xl border border-liceu-secondary/15 bg-white p-4 sm:grid-cols-4">
          <div>
            <p class="text-xs text-liceu-primary/60">Storage</p>
            <p class="text-sm font-semibold">{{ resumo?.storage_mode || 'memory' }}</p>
          </div>
          <div>
            <p class="text-xs text-liceu-primary/60">Retencao media</p>
            <p class="text-2xl font-bold">{{ analytics?.retencao_media_percentual ?? '-' }}%</p>
          </div>
          <div>
            <p class="text-xs text-liceu-primary/60">Conclusao media</p>
            <p class="text-2xl font-bold">{{ analytics?.conclusao_media_percentual ?? '-' }}%</p>
          </div>
          <div>
            <button
              class="rounded-lg border border-liceu-secondary/25 px-3 py-2 text-xs font-semibold"
              @click="carregarAnalytics"
            >
              Atualizar analytics
            </button>
          </div>
        </article>

        <article
          v-for="obra in obras"
          :key="obra.id"
          class="rounded-2xl border border-liceu-secondary/15 bg-white p-4"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 class="text-lg font-semibold text-liceu-primary">{{ obra.titulo }}</h3>
              <p class="text-sm text-liceu-primary/70">{{ obra.descricao }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-liceu-primary/60">Versão {{ obra.versao }}</p>
              <p class="rounded-full bg-liceu-secondary/10 px-3 py-1 text-xs font-semibold text-liceu-secondary">
                {{ statusLabel[obra.status_pipeline] }}
              </p>
            </div>
          </div>

          <div class="mt-3 flex flex-wrap gap-2">
            <button class="rounded-lg border border-liceu-secondary/25 px-3 py-1 text-xs" @click="estruturar(obra)">
              Estruturar IA John
            </button>
            <button class="rounded-lg border border-liceu-secondary/25 px-3 py-1 text-xs" @click="avancar(obra)">
              Avançar pipeline
            </button>
            <button class="rounded-lg border border-emerald-500/30 px-3 py-1 text-xs text-emerald-700" @click="publicar(obra)">
              Publicar
            </button>
            <button class="rounded-lg border border-sky-500/30 px-3 py-1 text-xs text-sky-700" @click="exportar(obra)">
              Exportar biblioteca
            </button>
          </div>

          <p class="mt-2 text-xs text-liceu-primary/65">
            Capítulos: {{ obra.capitulos?.length || 0 }} | Colaboração global:
            {{ obra.colaboradores_globais?.join(', ') || 'ia_john' }}
          </p>
        </article>

        <article class="rounded-2xl border border-liceu-secondary/15 bg-white p-4">
          <h3 class="text-lg font-semibold text-liceu-primary">Biblioteca Digital da Academia do Saber</h3>
          <p class="mt-1 text-xs text-liceu-primary/70">Obras publicadas prontas para PDF, EPUB, Web e impressao sob demanda.</p>

          <div v-if="biblioteca.length" class="mt-3 space-y-2">
            <div
              v-for="item in biblioteca"
              :key="item.obra_id"
              class="rounded-xl border border-liceu-secondary/15 px-3 py-2"
            >
              <p class="text-sm font-semibold">{{ item.titulo }}</p>
              <p class="text-xs text-liceu-primary/70">
                v{{ item.versao }} | {{ item.categoria }} | formatos: {{ item.formatos.join(', ') }}
              </p>
            </div>
          </div>

          <p v-else class="mt-3 text-sm text-liceu-primary/70">Ainda sem obras publicadas na biblioteca digital.</p>
        </article>

        <p v-if="!obras.length && !api.loading" class="rounded-xl bg-white p-4 text-sm text-liceu-primary/70">
          Nenhuma obra cadastrada ainda. Use o formulário ao lado para iniciar o pipeline.
        </p>
      </div>
    </div>
  </section>
</template>
