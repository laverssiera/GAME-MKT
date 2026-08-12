/**
 * EPIC - Marketing de Ecossistema Sustentável
 * Issue #12-13: Gamificação Saudável - Medalhas e Ranking
 */

import { Medalha, Conquista, RankingSaudavel, ActorTipo } from '../types/wellbeing'

export class GamificacaoSaudavel {
  /**
   * Catálogo de medalhas disponíveis
   */
  static MEDALHAS: Record<string, Medalha> = {
    parceiro_confiavel: {
      id: 'parceiro_confiavel',
      nome: '🤝 Parceiro Confiável',
      descricao: 'Mantém compromissos e prazos consistentemente',
      categoria: 'colaboracao',
      criterios: ['5 projetos completados no prazo', 'Taxa de satisfação > 90%'],
      ícone: '🤝',
    },
    equipe_equilibrada: {
      id: 'equipe_equilibrada',
      nome: '⚖️ Equipe Equilibrada',
      descricao: 'Mantém equilíbrio vida/trabalho acima de 80',
      categoria: 'equilíbrio',
      criterios: ['Score equilíbrio >= 80 por 4 semanas consecutivas', 'Horas extras <= 5/semana'],
      ícone: '⚖️',
    },
    fornecedor_eficiente: {
      id: 'fornecedor_eficiente',
      nome: '⚡ Fornecedor Eficiente',
      descricao: 'Entrega rápida e qualidade consistente',
      categoria: 'eficiencia',
      criterios: ['Tempo resposta < 24h', 'Qualidade >= 95%'],
      ícone: '⚡',
    },
    sustentabilidade_hero: {
      id: 'sustentabilidade_hero',
      nome: '🌱 Herói da Sustentabilidade',
      descricao: 'Promove bem-estar do ecossistema',
      categoria: 'sustentabilidade',
      criterios: ['Ajudou 3+ colegas a melhorar equilíbrio', 'Iniciou ações de bem-estar'],
      ícone: '🌱',
    },
    mentalidade_equilibrio: {
      id: 'mentalidade_equilibrio',
      nome: '🧠 Mentalidade de Equilíbrio',
      descricao: 'Promove cultura de bem-estar',
      categoria: 'equilíbrio',
      criterios: ['Comunicação sobre bem-estar', 'Suporta limite de horas'],
      ícone: '🧠',
    },
    colaboracao_genuina: {
      id: 'colaboracao_genuina',
      nome: '💪 Colaboração Genuína',
      descricao: 'Trabalha genuinamente com outros atores',
      categoria: 'colaboracao',
      criterios: ['3+ parcerias produtivas', 'Feedback positivo de parceiros'],
      ícone: '💪',
    },
    comeco_positivo: {
      id: 'comeco_positivo',
      nome: '🌟 Começo Positivo',
      descricao: 'Primeira melhoria detectada no bem-estar',
      categoria: 'equilíbrio',
      criterios: ['Score equilíbrio melhorou 20+ pontos'],
      ícone: '🌟',
    },
    comunicacao_clara: {
      id: 'comunicacao_clara',
      nome: '💬 Comunicação Clara',
      descricao: 'Comunica limites e necessidades abertamente',
      categoria: 'colaboracao',
      criterios: ['Participou de 5+ conversas de bem-estar', 'Transparência sobre carga'],
      ícone: '💬',
    },
  }

  /**
   * Verifica se usuário qualificou para uma medalha
   */
  static verificarConquista(
    usuario_id: string,
    actor_tipo: ActorTipo,
    metricas: Record<string, number>
  ): Medalha[] {
    const conquistadas: Medalha[] = []

    // Verificar cada medalha
    if (actor_tipo === ActorTipo.FORNECEDOR && metricas.tempo_resposta < 24 && metricas.qualidade >= 95) {
      conquistadas.push(this.MEDALHAS.fornecedor_eficiente)
    }

    if (metricas.equilibrio >= 80) {
      conquistadas.push(this.MEDALHAS.equipe_equilibrada)
    }

    if (metricas.equilibrio_melhoria && metricas.equilibrio_melhoria > 20) {
      conquistadas.push(this.MEDALHAS.comeco_positivo)
    }

    if (metricas.satisfacao_parceiros >= 90 && metricas.projetos_no_prazo >= 5) {
      conquistadas.push(this.MEDALHAS.parceiro_confiavel)
    }

    if (metricas.score_colaboracao >= 80) {
      conquistadas.push(this.MEDALHAS.colaboracao_genuina)
    }

    if (metricas.score_comunicacao >= 75) {
      conquistadas.push(this.MEDALHAS.comunicacao_clara)
    }

    return conquistadas
  }

  /**
   * Gera ranking saudável (não competitivo)
   */
  static gerarRankingSaudavel(
    usuarios: Array<{
      id: string
      actor_tipo: ActorTipo
      nome: string
      equilibrio: number
      medalhas_count: number
      tendencia: 'melhorando' | 'estavel' | 'piorando'
    }>,
    categoria?: string
  ): RankingSaudavel[] {
    // Filtrar por categoria se especificado
    let usuarios_filtrados = usuarios
    if (categoria) {
      usuarios_filtrados = usuarios.filter((u) => {
        if (categoria === 'fornecedor') return u.actor_tipo === ActorTipo.FORNECEDOR
        if (categoria === 'colaborador') return u.actor_tipo === ActorTipo.COLABORADOR
        return true
      })
    }

    // Ordenar por equilíbrio (descendente) + tendência (melhorando primeiro)
    const ranking = usuarios_filtrados
      .map((u, idx) => {
        // Score: 70% equilíbrio + 20% medalhas + 10% tendência
        const score_tendencia = u.tendencia === 'melhorando' ? 30 : u.tendencia === 'piorando' ? 0 : 15

        return {
          posicao: idx + 1,
          actor_id: u.id,
          actor_tipo: u.actor_tipo,
          nome: u.nome,
          score_equilibrio: u.equilibrio,
          tendencia: u.tendencia,
          medalhas: u.medalhas_count,
          categoria: categoria || 'todos',
          score_ranking: u.equilibrio * 0.7 + u.medalhas_count * 10 * 0.2 + score_tendencia * 0.1,
        }
      })
      .sort((a, b) => {
        // Ordenação: equilíbrio > medalhas > tendência
        if (a.score_equilibrio !== b.score_equilibrio) {
          return b.score_equilibrio - a.score_equilibrio
        }
        if (a.medalhas !== b.medalhas) {
          return b.medalhas - a.medalhas
        }
        return b.score_ranking - a.score_ranking
      })

    // Re-indexar posições após sort
    return ranking.map((r, idx) => ({
      ...r,
      posicao: idx + 1,
    }))
  }

  /**
   * Mensagem de conquista personalizada
   */
  static mensagemConquista(medalha: Medalha, usuario_nome: string): string {
    const mensagens: Record<string, string> = {
      parceiro_confiavel: `${usuario_nome} conquistou 🤝 Parceiro Confiável! A gente pode contar com essa pessoa.`,
      equipe_equilibrada: `${usuario_nome} conseguiu ⚖️ Equipe Equilibrada! Tá levando vida e trabalho bem sério.`,
      fornecedor_eficiente: `${usuario_nome} é ⚡ Fornecedor Eficiente! Rápido e de qualidade.`,
      sustentabilidade_hero: `${usuario_nome} é 🌱 Herói da Sustentabilidade! Tá cuidando do bem-estar de todos.`,
      mentalidade_equilibrio: `${usuario_nome} tem 🧠 Mentalidade de Equilíbrio! Promove uma cultura saudável.`,
      colaboracao_genuina: `${usuario_nome} é 💪 Colaboração Genuína! Trabalha bem com todo mundo.`,
      comeco_positivo: `${usuario_nome} começou 🌟 Positivo! Equilíbrio melhorando muito bom!`,
      comunicacao_clara: `${usuario_nome} tem 💬 Comunicação Clara! Fala aberto sobre necessidades.`,
    }

    return mensagens[medalha.id] || `${usuario_nome} conquistou ${medalha.ícone} ${medalha.nome}!`
  }

  /**
   * Compara com benchmark de bem-estar (grupo)
   */
  static compararComGrupo(usuario_equilibrio: number, usuarios_todos: number[]): string {
    const media = usuarios_todos.reduce((a, b) => a + b, 0) / usuarios_todos.length
    const percentil = (usuarios_todos.filter((e) => e <= usuario_equilibrio).length / usuarios_todos.length) * 100

    if (percentil >= 80) return `Top ${Math.round(100 - percentil)}% de bem-estar`
    if (percentil >= 60) return `Acima da média em equilíbrio`
    if (percentil >= 40) return `Na média do grupo`
    if (percentil >= 20) return `Abaixo da média, mas recuperável`
    return `Crítico - precisa de suporte`
  }

  /**
   * Evita competição agressiva (não mostra posição exata pública)
   */
  static rangingSaudavel_PublicoOmitido(ranking: RankingSaudavel[], usuario_id: string): any {
    return ranking.map((r: any) => ({
      ...r,
      posicao: r.actor_id === usuario_id ? r.posicao : undefined, // Só mostra própria posição
      nome: r.actor_id === usuario_id ? r.nome : `${r.actor_type} ${r.medalhas}🏅`, // Anonimiza others
    }))
  }

  /**
   * Sugestão de meta realista (não agressiva)
   */
  static sugerirMetaEquilibrio(equilibrio_atual: number, tendencia: string): { meta: number; prazo_semanas: number; acoes: string[] } {
    let meta = equilibrio_atual + 15 // Meta: melhorar 15 pontos
    let prazo = 8 // 8 semanas

    if (equilibrio_atual < 30) {
      meta = Math.min(50, equilibrio_atual + 25) // Mais agressivo se crítico
      prazo = 6
    } else if (equilibrio_atual > 80) {
      meta = 85 // Manter acima de 85
      prazo = 52 // Manutenção longa
    }

    const acoes =
      equilibrio_atual < 40
        ? [
            'Conversar com gestor sobre redistribuição',
            'Começar pausas de 15min cada hora',
            'Definir limite diário de horas',
          ]
        : equilibrio_atual < 60
          ? [
              'Aumentar tempo offline em 5h/semana',
              'Ampliar 2-3 prazos',
              'Reduzir horas extras para < 5/semana',
            ]
          : ['Manter práticas atuais', 'Compartilhar aprendizado com equipe']

    return { meta, prazo_semanas: prazo, acoes }
  }
}
