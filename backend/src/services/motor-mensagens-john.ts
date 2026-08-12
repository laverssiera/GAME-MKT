/**
 * EPIC 4 - Integração John Brasileiro
 * Motor de mensagens humanizadas baseado em métricas
 */

export interface ContextoMetrica {
  tipo: string
  valor: number
  unidade: string
  tendencia?: 'subindo' | 'descendo' | 'estavel'
  comparacao_anterior?: number
}

export interface MensagemJohn {
  mensagem: string
  tom: 'motivador' | 'alerta' | 'neutro' | 'urgente'
  acao_sugerida?: string
  emoji?: string
}

export class MotorMensagensJohn {
  /**
   * Gera mensagem baseada em contexto de métrica
   */
  static gerar(contexto: ContextoMetrica): MensagemJohn {
    const { tipo, valor, tendencia, comparacao_anterior } = contexto

    // Análise de contexto
    switch (tipo) {
      case 'CAC':
        return this.analisarCAC(valor, tendencia)
      case 'LTV':
        return this.analisarLTV(valor, tendencia)
      case 'conversao':
        return this.analisarConversao(valor, tendencia)
      case 'ROI':
        return this.analisarROI(valor, tendencia)
      case 'engajamento_geral':
        return this.analisarEngajamento(valor, tendencia)
      case 'lead_score':
        return this.analisarLeadScore(valor)
      case 'satisfacao':
        return this.analisarSatisfacao(valor, tendencia)
      default:
        return this.analisarGenerico(tipo, valor, tendencia)
    }
  }

  private static analisarCAC(valor: number, tendencia?: string): MensagemJohn {
    if (valor < 50) {
      return {
        mensagem: 'Tá barato demais conquistar cliente! Parabéns, seu CAC tá de arma apontada pro céu.',
        tom: 'motivador',
        emoji: '🎯',
        acao_sugerida: 'Aproveita esse momento pra escalar os gastos com campanha.',
      }
    }
    if (valor < 200) {
      return {
        mensagem: 'Seu CAC tá bacana. Cada cliente tá custando um preço justo.',
        tom: 'neutro',
        emoji: '✅',
      }
    }
    if (valor < 500) {
      return {
        mensagem: 'Ó, CAC tá subindo de mais. Tá caro pra conquistar cliente, colega.',
        tom: 'alerta',
        emoji: '⚠️',
        acao_sugerida: 'Otimiza teus canais de aquisição, tá ficando caro demais.',
      }
    }
    return {
      mensagem: 'Meu deus, tá caríssimo conquistar cliente! Isso tá insano, bora mexer nisso agora.',
      tom: 'urgente',
      emoji: '🚨',
      acao_sugerida: 'Pausa campanhas com baixo ROI e redireciona pra canais mais baratos.',
    }
  }

  private static analisarLTV(valor: number, tendencia?: string): MensagemJohn {
    if (valor < 500) {
      return {
        mensagem: 'Seus clientes tão valendo pouco a longo prazo. Bora aumentar retenção.',
        tom: 'alerta',
        emoji: '📉',
        acao_sugerida: 'Foca em retenção e upsell pra aumentar o LTV.',
      }
    }
    if (valor < 2000) {
      return {
        mensagem: 'Seu LTV tá na média. Clientes valem uma grana, mas pode crescer ainda mais.',
        tom: 'neutro',
        emoji: '📊',
      }
    }
    return {
      mensagem: 'Seus clientes valem uma fortuna! LTV tá muito alto, tá lucrando mesmo.',
      tom: 'motivador',
      emoji: '💰',
      acao_sugerida: 'Aproveita pra investir em retenção premium e VIP.',
    }
  }

  private static analisarConversao(valor: number, tendencia?: string): MensagemJohn {
    if (valor < 2) {
      return {
        mensagem: 'Conversão muito baixa, meu amigo. Nem 2% dos leads tá virando cliente.',
        tom: 'urgente',
        emoji: '🚨',
        acao_sugerida: 'Revisa tua landing page, copy e call-to-action. Algo tá errado.',
      }
    }
    if (valor < 5) {
      return {
        mensagem: 'Conversão tá abaixo da média. Bora otimizar seu funil de vendas.',
        tom: 'alerta',
        emoji: '⚠️',
        acao_sugerida: 'Testa diferentes versions da proposta e copy.',
      }
    }
    if (valor < 10) {
      return {
        mensagem: 'Tá fechando bonito! Sua conversão tá na média do mercado.',
        tom: 'neutro',
        emoji: '✅',
      }
    }
    return {
      mensagem: 'Conversão acima da média! Tá fechando muito bem mesmo. Bola de ouro!',
      tom: 'motivador',
      emoji: '🎉',
      acao_sugerida: 'Documenta essa estratégia pra replicar em outras campanhas.',
    }
  }

  private static analisarROI(valor: number, tendencia?: string): MensagemJohn {
    if (valor < 0) {
      return {
        mensagem: 'Seu ROI tá negativo, cara. Tá perdendo dinheiro nisso.',
        tom: 'urgente',
        emoji: '💔',
        acao_sugerida: 'Pausa essa campanha agora mesmo e analisa o que tá acontecendo.',
      }
    }
    if (valor < 50) {
      return {
        mensagem: 'ROI baixo demais. Pra cada real investido, você tá ganhando pouco.',
        tom: 'alerta',
        emoji: '⚠️',
        acao_sugerida: 'Reduz a frequência dos gastos e testa novos públicos.',
      }
    }
    if (valor < 200) {
      return {
        mensagem: 'ROI tá bom, colega. Cada real investido tá rendendo bacana.',
        tom: 'motivador',
        emoji: '📈',
      }
    }
    return {
      mensagem: 'Que ROI é esse?! Tá gerando grana que nem máquina! Tá de arma apontada pro céu.',
      tom: 'motivador',
      emoji: '💰',
      acao_sugerida: 'Scale isso rapidinho, tá de verdade sendo lucrativo!',
    }
  }

  private static analisarEngajamento(valor: number, tendencia?: string): MensagemJohn {
    if (valor < 30) {
      return {
        mensagem: 'Engajamento muito baixo. Galera não tá se interessando mesmo.',
        tom: 'urgente',
        emoji: '😴',
        acao_sugerida: 'Revisa teu conteúdo, landing e proposta de valor.',
      }
    }
    if (valor < 60) {
      return {
        mensagem: 'Engajamento tá morno. Galera visitando mas não tá interagindo muito.',
        tom: 'alerta',
        emoji: '😐',
        acao_sugerida: 'Adiciona mais CTAs, forms e oportunidades de interação.',
      }
    }
    return {
      mensagem: 'Galera tá engajada demais! Seu público tá voltando, clicando e conversando.',
      tom: 'motivador',
      emoji: '🔥',
      acao_sugerida: 'Aproveita esse momentum pra coletar leads e converter.',
    }
  }

  private static analisarLeadScore(valor: number): MensagemJohn {
    if (valor < 30) {
      return {
        mensagem: 'Lead tá frio demais. Pouca chance de comprar agora.',
        tom: 'neutro',
        emoji: '❄️',
        acao_sugerida: 'Bota em nurture pra aquecer com conteúdo relevante.',
      }
    }
    if (valor < 70) {
      return {
        mensagem: 'Lead tá morno, colega. Ainda precisa de um empurrãozinho.',
        tom: 'neutro',
        emoji: '🌡️',
        acao_sugerida: 'Foca em conteúdo educativo e social proof.',
      }
    }
    return {
      mensagem: 'Esse lead tá QUENTE! Tá pronto pra ser prospectado agora mesmo.',
      tom: 'urgente',
      emoji: '🔥',
      acao_sugerida: 'Bora ligar, chamar pro whatsapp, vender agora!',
    }
  }

  private static analisarSatisfacao(valor: number, tendencia?: string): MensagemJohn {
    if (valor < 0.4) {
      return {
        mensagem: 'Cliente tá insatisfeito demais. Bora salvar esse relacionamento.',
        tom: 'urgente',
        emoji: '😞',
        acao_sugerida: 'Entrena em contato, oferece suporte e busca feedback.',
      }
    }
    if (valor < 0.7) {
      return {
        mensagem: 'Cliente tá mais ou menos. Não tá insatisfeito, mas pode melhorar.',
        tom: 'neutro',
        emoji: '😐',
      }
    }
    return {
      mensagem: 'Cliente tá muito feliz! Satisfação no topo, bora pedir referência.',
      tom: 'motivador',
      emoji: '😊',
      acao_sugerida: 'Pede pra indicar, colhe depoimento e oferece programa de fidelização.',
    }
  }

  private static analisarGenerico(tipo: string, valor: number, tendencia?: string): MensagemJohn {
    let tom: MensagemJohn['tom'] = 'neutro'
    let emoji = '📊'

    if (tendencia === 'subindo') {
      tom = 'motivador'
      emoji = '📈'
    } else if (tendencia === 'descendo') {
      tom = 'alerta'
      emoji = '📉'
    }

    return {
      mensagem: `Sua métrica ${tipo} tá em ${valor.toFixed(2)}. ${tendencia ? `Tá ${tendencia}.` : ''}`,
      tom,
      emoji,
    }
  }

  /**
   * Template dinâmico parametrizado
   */
  static template(template: string, valores: Record<string, any>): string {
    let resultado = template
    Object.entries(valores).forEach(([chave, valor]) => {
      resultado = resultado.replace(`{${chave}}`, String(valor))
    })
    return resultado
  }

  /**
   * Exemplos de templates narrativos
   */
  static readonly TEMPLATES = {
    LEADS_QUENTES: 'Você tem {leads} leads quentes esperando no Portal do Corretor. Bora fechar?',
    ROI_SUBIU: 'ROI subiu {percentual}%! Tá gerando grana mesmo.',
    CONVERSAO_BAIXA: 'Conversão caiu {percentual}%. Bora revisar o funil.',
    ENGAJAMENTO_ALTO: 'Engajamento tá {valor}%! Galera tá muito interessada.',
    RANKING: 'Você tá em {posicao}º no ranking. {proximo_step}',
  }
}
