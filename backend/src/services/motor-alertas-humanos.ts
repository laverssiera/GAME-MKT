/**
 * EPIC - Marketing de Ecossistema Sustentável
 * Issue #6-7: Alertas humanizados de bem-estar
 */

import { AlertaBemEstar, EquilibrioStatus, ActorTipo } from '../types/wellbeing'

export interface ContextoAlerta {
  actor_id: string
  actor_tipo: ActorTipo
  equilibrio_status: EquilibrioStatus
  carga_trabalho: number
  produtividade: number
  tempo_offline: number
  horas_extras: number
  tendencia: 'melhorando' | 'estavel' | 'piorando'
}

export class MotorAlertasHumanos {
  /**
   * Gera alertas baseado em contexto
   */
  static gerar(contexto: ContextoAlerta): AlertaBemEstar[] {
    const alertas: AlertaBemEstar[] = []

    // ALERTA 1: Sobrecarga detectada
    if (contexto.equilibrio_status === EquilibrioStatus.SOBRECARGA) {
      alertas.push({
        id: `alerta_${Date.now()}_1`,
        tipo: 'sobrecarga',
        actor_id: contexto.actor_id,
        actor_tipo: contexto.actor_tipo,
        severidade: contexto.carga_trabalho > 90 ? 'critica' : 'alta',
        mensagem: this.mensagemSobrecarga(contexto),
        acao_sugerida: 'Redistribuir tarefas ou ampliar prazos',
        timestamp: new Date(),
        lido: false,
      })
    }

    // ALERTA 2: Cansaço detectado (poucas pausas, muito offline faltando)
    if (contexto.tempo_offline < 20 && contexto.horas_extras > 10) {
      alertas.push({
        id: `alerta_${Date.now()}_2`,
        tipo: 'cansaco',
        actor_id: contexto.actor_id,
        actor_tipo: contexto.actor_tipo,
        severidade: contexto.tempo_offline < 10 ? 'critica' : 'alta',
        mensagem: this.mensagemCansaco(contexto),
        acao_sugerida: 'Fazer pausas mais frequentes, reduzir horas',
        timestamp: new Date(),
        lido: false,
      })
    }

    // ALERTA 3: Produtividade caindo (sinal de burnout)
    if (contexto.produtividade < 40 && contexto.tendencia === 'piorando') {
      alertas.push({
        id: `alerta_${Date.now()}_3`,
        tipo: 'pressao',
        actor_id: contexto.actor_id,
        actor_tipo: contexto.actor_tipo,
        severidade: 'critica',
        mensagem: this.mensagemPressao(contexto),
        acao_sugerida: 'Conversar com gestor, reduzir carga imediatamente',
        timestamp: new Date(),
        lido: false,
      })
    }

    // ALERTA 4: Desbalanceio geral
    if (contexto.equilibrio_status === EquilibrioStatus.ATENCAO && contexto.tendencia === 'piorando') {
      alertas.push({
        id: `alerta_${Date.now()}_4`,
        tipo: 'desbalanceio',
        actor_id: contexto.actor_id,
        actor_tipo: contexto.actor_tipo,
        severidade: 'media',
        mensagem: this.mensagemDesbalanceio(contexto),
        acao_sugerida: 'Revisar prioridades, equilibrar melhor',
        timestamp: new Date(),
        lido: false,
      })
    }

    // ALERTA POSITIVO: Melhora detectada
    if (contexto.tendencia === 'melhorando' && contexto.equilibrio_status === EquilibrioStatus.SAUDAVEL) {
      alertas.push({
        id: `alerta_${Date.now()}_5`,
        tipo: 'sobrecarga', // mesmo tipo, mas severidade baixa = motivação
        actor_id: contexto.actor_id,
        actor_tipo: contexto.actor_tipo,
        severidade: 'baixa',
        mensagem: `🌟 Parabéns! Seu equilíbrio tá melhorando. Mantém assim!`,
        acao_sugerida: 'Continuar as práticas que estão funcionando',
        timestamp: new Date(),
        lido: false,
      })
    }

    return alertas
  }

  /**
   * Mensagem de sobrecarga contextualizada
   */
  private static mensagemSobrecarga(contexto: ContextoAlerta): string {
    const ator_nome = contexto.actor_tipo === ActorTipo.FORNECEDOR ? 'Fornecedor' : 'Você'

    if (contexto.carga_trabalho > 90) {
      return `🚨 ${ator_nome} tá sobrecargado demais (${contexto.carga_trabalho}%). Algo precisa mudar AGORA.`
    }
    if (contexto.carga_trabalho > 75) {
      return `⚠️ ${ator_nome} tá na beirada. Carga em ${contexto.carga_trabalho}%. Precisa agir logo.`
    }
    return `Carga de trabalho acima do saudável: ${contexto.carga_trabalho}%`
  }

  /**
   * Mensagem de cansaço
   */
  private static mensagemCansaco(contexto: ContextoAlerta): string {
    const ator_nome = contexto.actor_tipo === ActorTipo.COLABORADOR ? 'O time' : 'Esse ator'

    if (contexto.horas_extras > 20) {
      return `😴 ${ator_nome} tá puxando demais. ${contexto.horas_extras}h extras por semana é insano.`
    }
    if (contexto.tempo_offline < 10) {
      return `😵 Tempo offline crítico: ${contexto.tempo_offline}h/semana. ${ator_nome} precisa descansar.`
    }
    return `${ator_nome} tá cansado. Pausas e descanso urgente.`
  }

  /**
   * Mensagem de pressão/burnout
   */
  private static mensagemPressao(contexto: ContextoAlerta): string {
    return `🔴 CRÍTICO! Produtividade caindo (${contexto.produtividade}%) e tendência piorando. Sinal de burnout.`
  }

  /**
   * Mensagem de desbalanceio
   */
  private static mensagemDesbalanceio(contexto: ContextoAlerta): string {
    return `⚖️ Equilíbrio vida/trabalho tá desbalanceando. ${contexto.carga_trabalho > 60 ? 'Trabalho demais' : 'Algo mais tá indo mal'}.`
  }

  /**
   * Valida se alerta já foi enviado (para evitar spam)
   */
  static deveEnviar(
    alerta_novo: AlertaBemEstar,
    alertas_anteriores: AlertaBemEstar[],
    minutos_entre_alertas: number = 60
  ): boolean {
    const alertas_similares = alertas_anteriores.filter(
      (a) => a.actor_id === alerta_novo.actor_id && a.tipo === alerta_novo.tipo && !a.lido
    )

    if (alertas_similares.length === 0) return true

    const ultimo_alerta = alertas_similares[alertas_similares.length - 1]
    const minutos_passados = (Date.now() - ultimo_alerta.timestamp.getTime()) / 60000

    return minutos_passados >= minutos_entre_alertas
  }

  /**
   * Escalação de alerta
   */
  static escalar(alerta: AlertaBemEstar): AlertaBemEstar {
    const severidade_ordem = { baixa: 0, media: 1, alta: 2, critica: 3 }
    const nova_ordem = Math.min(3, severidade_ordem[alerta.severidade] + 1)
    const nova_severidade = ['baixa', 'media', 'alta', 'critica'][nova_ordem]

    return {
      ...alerta,
      severidade: nova_severidade as any,
      mensagem: `[ESCALADO] ${alerta.mensagem}`,
    }
  }

  /**
   * Notificação para John Brasileiro enviar
   */
  static formatarParaJohn(alerta: AlertaBemEstar, ator_nome?: string): string {
    const nome = ator_nome || alerta.actor_id

    if (alerta.severidade === 'critica') {
      return `Ó! ${nome} tá em situação crítica. ${alerta.mensagem}. Bora atuar?`
    }
    if (alerta.severidade === 'alta') {
      return `${nome}, presta atenção: ${alerta.mensagem}`
    }
    if (alerta.severidade === 'media') {
      return `${nome}, só dando um toque: ${alerta.mensagem}`
    }

    return `Boa notícia! ${nome}, ${alerta.mensagem}`
  }
}
