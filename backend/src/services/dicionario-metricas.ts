/**
 * EPIC 3 - Tradução de Siglas (Humanização)
 * Dicionário de métricas traduzidas para linguagem clara
 */

export interface MetricaHumanizada {
  tecnico: string
  descricao: string
  john_message?: string
  categoria: string
  exemplo_uso: string
}

export const METRICAS_HUMANIZADAS: Record<string, MetricaHumanizada> = {
  CAC: {
    tecnico: 'CAC',
    descricao: 'Quanto custa conquistar um cliente',
    john_message: 'Tá caro conquistar cliente, meu amigo',
    categoria: 'Aquisição',
    exemplo_uso: 'CAC atual: R$ 150. Isso significa que cada cliente novo te custa esse dinheiro.',
  },
  LTV: {
    tecnico: 'LTV',
    descricao: 'Quanto o cliente vale ao longo do tempo',
    john_message: 'Seus clientes valem uma grana no longo prazo',
    categoria: 'Valor',
    exemplo_uso: 'LTV: R$ 1.500. Em média, cada cliente gera esse valor em receita durante o relacionamento.',
  },
  CTR: {
    tecnico: 'CTR',
    descricao: 'Quantos se interessaram de verdade',
    john_message: 'Seu anúncio tá chamando atenção',
    categoria: 'Engajamento',
    exemplo_uso: 'CTR: 3.5%. Significa que 3.5 de cada 100 pessoas que viram seu anúncio clicaram.',
  },
  conversao: {
    tecnico: 'Taxa de Conversão',
    descricao: 'Percentual de leads que viraram clientes',
    john_message: 'Tá fechando bonito',
    categoria: 'Conversão',
    exemplo_uso: 'Conversão: 8%. De cada 100 leads, 8 viraram clientes.',
  },
  ticket_medio: {
    tecnico: 'Ticket Médio',
    descricao: 'Valor médio de cada venda',
    john_message: 'Seu ticket tá crescendo',
    categoria: 'Valor',
    exemplo_uso: 'Ticket Médio: R$ 3.200. Cada venda tem esse valor em média.',
  },
  ROI: {
    tecnico: 'ROI',
    descricao: 'O retorno que você tem sobre o investimento em marketing',
    john_message: 'Seu investimento tá rendendo',
    categoria: 'Valor',
    exemplo_uso: 'ROI: 250%. Para cada R$ 1 investido, você ganhou R$ 2,50.',
  },
  engajamento_geral: {
    tecnico: 'Engajamento Geral',
    descricao: 'Como seus leads estão interagindo com você',
    john_message: 'Galera tá engajada demais',
    categoria: 'Engajamento',
    exemplo_uso: 'Engajamento: 72%. Seus leads tão voltando, clicando e conversando bastante.',
  },
  ltv_cac_ratio: {
    tecnico: 'Relação LTV/CAC',
    descricao: 'Quantas vezes o cliente vale em relação ao custo de aquisição',
    john_message: 'Tá valendo a pena conquistar cliente',
    categoria: 'Valor',
    exemplo_uso: 'LTV/CAC: 10x. Cada cliente vale 10 vezes mais do que custa conquistá-lo.',
  },
  lead_score: {
    tecnico: 'Lead Score',
    descricao: 'Probabilidade de um lead virar cliente',
    john_message: 'Esse lead tá quente demais',
    categoria: 'Qualidade',
    exemplo_uso: 'Lead Score: 92/100. Esse lead tem grande chance de comprar em breve.',
  },
  satisfacao: {
    tecnico: 'Score de Satisfação',
    descricao: 'Nível de satisfação do cliente com a sua marca',
    john_message: 'Cliente tá feliz demais',
    categoria: 'Satisfação',
    exemplo_uso: 'Satisfação: 85%. Seus clientes tão muito contentes com você.',
  },
}

export class DicionarioMetricas {
  /**
   * Retorna tradução humanizada de uma métrica
   */
  static traduzir(tecnico: string): MetricaHumanizada | null {
    return METRICAS_HUMANIZADAS[tecnico] || null
  }

  /**
   * Retorna apenas a descrição clara
   */
  static descricao(tecnico: string): string {
    return METRICAS_HUMANIZADAS[tecnico]?.descricao || tecnico
  }

  /**
   * Retorna mensagem do John para uma métrica
   */
  static mensagemJohn(tecnico: string): string {
    return METRICAS_HUMANIZADAS[tecnico]?.john_message || `Sua métrica ${tecnico} tá se movimentando`
  }

  /**
   * Lista todas as métricas humanizadas
   */
  static listarTodas(): Record<string, MetricaHumanizada> {
    return METRICAS_HUMANIZADAS
  }

  /**
   * Busca por categoria
   */
  static porCategoria(categoria: string): MetricaHumanizada[] {
    return Object.values(METRICAS_HUMANIZADAS).filter((m) => m.categoria === categoria)
  }
}
