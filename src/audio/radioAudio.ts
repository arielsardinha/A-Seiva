/**
 * Som do app, 100% sintetizado com WebAudio (nenhum arquivo, nenhuma rede). Dois interruptores independentes:
 *  - "Sons do rádio": chiado enquanto busca, bipes e cliques. O chiado some quando o canal conecta.
 *  - "O que a Dra. Lis ouve": as camadas do roteiro (passos, floresta…), só com o canal conectado.
 * Tudo fica mudo até o usuário ligar o interruptor (um gesto, como o navegador exige).
 * Os níveis são baixos de propósito: o app é usado com fones, ao lado de um microfone.
 */
import type { CamadaEscuta } from '../data/cena01'
import { Camadas } from './camadas'

export type EstadoSom = 'desligado' | 'iniciando' | 'buscando' | 'conectado' | 'alerta'

interface PerfilChiado {
  ganho: number
  /** Variação aleatória do ganho, para o chiado "respirar" */
  oscilacao: number
  centro: number
  q: number
  /** Constante de tempo (s) com que o chiado chega a este nível; pequena = corta de uma vez */
  transicao: number
}

// Conectado e alerta: canal fechado, sem chiado nenhum.
const PERFIS: Record<EstadoSom, PerfilChiado> = {
  desligado: { ganho: 0, oscilacao: 0, centro: 2500, q: 0.5, transicao: 0.05 },
  iniciando: { ganho: 0.06, oscilacao: 0.4, centro: 2200, q: 0.6, transicao: 0.15 },
  buscando: { ganho: 0.14, oscilacao: 0.7, centro: 2600, q: 0.8, transicao: 0.15 },
  conectado: { ganho: 0, oscilacao: 0, centro: 3200, q: 0.4, transicao: 0.04 },
  alerta: { ganho: 0, oscilacao: 0, centro: 1900, q: 0.3, transicao: 0.04 },
}

class RadioAudio {
  private ctx: AudioContext | null = null
  private mestre: GainNode | null = null
  private chiadoGanho: GainNode | null = null
  private chiadoFiltro: BiquadFilterNode | null = null
  private ruido: AudioBuffer | null = null
  private camadas: Camadas | null = null
  private radioAtivo = false
  private escutaAtiva = false
  private estado: EstadoSom = 'desligado'
  private desejadas: readonly CamadaEscuta[] = []
  private timerChiado: number | undefined
  private timerBusca: number | undefined

  get disponivel() {
    return typeof window !== 'undefined' && 'AudioContext' in window
  }

  /** Liga "Sons do rádio". Precisa ser chamado dentro de um clique/tecla do usuário. */
  async ativar(): Promise<boolean> {
    if (!(await this.garantirContexto())) return false
    this.radioAtivo = true
    this.aplicarEstado()
    this.tique()
    return true
  }

  desativar() {
    this.radioAtivo = false
    this.parar()
    this.silenciarChiado(0.05)
  }

  /** Liga "O que a Dra. Lis ouve". Também precisa de um gesto do usuário. */
  async ativarEscuta(): Promise<boolean> {
    if (!(await this.garantirContexto())) return false
    this.escutaAtiva = true
    this.camadas?.definir(this.desejadas)
    return true
  }

  desativarEscuta() {
    this.escutaAtiva = false
    this.camadas?.definir([])
  }

  /** Quais camadas devem estar no ar agora (só tocam se o interruptor estiver ligado). */
  setCamadas(ids: readonly CamadaEscuta[]) {
    this.desejadas = ids
    if (this.escutaAtiva) this.camadas?.definir(ids)
  }

  setEstado(estado: EstadoSom) {
    if (estado === this.estado) return
    this.estado = estado
    this.aplicarEstado()
  }

  /** Clique do botão de liga/desliga, com um "tum" curto e um bipe de partida ao ligar. */
  clique(ligando: boolean) {
    const t = this.agora()
    if (t === null) return
    this.estalo(t, 0.22)
    this.tom(t, 90, 0.07, 0.18, 'sine', 55)
    if (ligando) this.tom(t + 0.12, 380, 0.28, 0.05, 'triangle', 980)
    else this.tom(t + 0.05, 700, 0.22, 0.05, 'triangle', 220)
  }

  /** Bipe de confirmação do canal seguro: dois tons subindo. */
  confirmar() {
    const t = this.agora()
    if (t === null) return
    this.estalo(t, 0.12)
    this.tom(t + 0.04, 880, 0.12, 0.12, 'sine')
    this.tom(t + 0.2, 1320, 0.22, 0.12, 'sine')
  }

  /** Fim de transmissão: o "squelch" que fecha o canal. */
  encerrar() {
    const t = this.agora()
    if (t === null) return
    this.rajada(t, 0.22, 0.09, 3000)
    this.estalo(t + 0.22, 0.2)
    this.tom(t + 0.24, 520, 0.08, 0.05, 'sine')
  }

  private async garantirContexto(): Promise<boolean> {
    if (!this.disponivel) return false
    try {
      if (!this.ctx) this.montar()
      await this.ctx?.resume()
    } catch {
      return false
    }
    return true
  }

  private montar() {
    const ctx = new AudioContext()
    const mestre = ctx.createGain()
    mestre.gain.value = 0.8
    mestre.connect(ctx.destination)

    // 2 s de ruído branco que fica em loop
    const ruido = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const dados = ruido.getChannelData(0)
    for (let i = 0; i < dados.length; i++) dados[i] = Math.random() * 2 - 1

    const fonte = ctx.createBufferSource()
    fonte.buffer = ruido
    fonte.loop = true
    const filtro = ctx.createBiquadFilter()
    filtro.type = 'bandpass'
    const ganho = ctx.createGain()
    ganho.gain.value = 0
    fonte.connect(filtro).connect(ganho).connect(mestre)
    fonte.start()

    const escuta = ctx.createGain()
    escuta.gain.value = 0.8
    escuta.connect(mestre)

    this.ctx = ctx
    this.mestre = mestre
    this.ruido = ruido
    this.chiadoFiltro = filtro
    this.chiadoGanho = ganho
    this.camadas = new Camadas(ctx, escuta, ruido)
  }

  private agora(): number | null {
    return this.radioAtivo && this.ctx && this.ctx.state === 'running' ? this.ctx.currentTime : null
  }

  private parar() {
    window.clearInterval(this.timerChiado)
    window.clearInterval(this.timerBusca)
    this.timerChiado = undefined
    this.timerBusca = undefined
  }

  private silenciarChiado(transicao: number) {
    if (!this.ctx || !this.chiadoGanho) return
    const t = this.ctx.currentTime
    this.chiadoGanho.gain.cancelScheduledValues(t)
    this.chiadoGanho.gain.setTargetAtTime(0, t, transicao)
  }

  private aplicarEstado() {
    this.parar()
    if (!this.radioAtivo || !this.ctx || !this.chiadoGanho || !this.chiadoFiltro) return
    const perfil = PERFIS[this.estado]
    const t = this.ctx.currentTime
    this.chiadoFiltro.Q.setTargetAtTime(perfil.q, t, 0.1)
    this.chiadoFiltro.frequency.setTargetAtTime(perfil.centro, t, 0.1)
    this.chiadoGanho.gain.cancelScheduledValues(t)
    this.chiadoGanho.gain.setTargetAtTime(perfil.ganho, t, perfil.transicao)
    if (perfil.ganho === 0) return

    // o chiado "respira": ganho e faixa mudam aos poucos
    this.timerChiado = window.setInterval(() => {
      if (!this.ctx || !this.chiadoGanho || !this.chiadoFiltro) return
      const agora = this.ctx.currentTime
      const sorte = 1 - perfil.oscilacao * Math.random()
      this.chiadoGanho.gain.setTargetAtTime(perfil.ganho * sorte, agora, 0.04)
      if (this.estado === 'buscando') {
        this.chiadoFiltro.frequency.setTargetAtTime(1200 + Math.random() * 3600, agora, 0.05)
      }
    }, 130)

    if (this.estado === 'buscando') {
      this.bipeBusca()
      this.timerBusca = window.setInterval(() => this.bipeBusca(), 1500)
    }
  }

  private bipeBusca() {
    const t = this.agora()
    if (t === null) return
    const alto = Math.random() < 0.3
    this.tom(t, alto ? 1500 : 1050, 0.07, 0.045, 'sine')
  }

  /** Tom simples com ataque e queda rápidos. `ate` faz o tom deslizar até outra frequência. */
  private tom(inicio: number, freq: number, dur: number, vol: number, tipo: OscillatorType, ate?: number) {
    if (!this.ctx || !this.mestre) return
    const osc = this.ctx.createOscillator()
    const g = this.ctx.createGain()
    osc.type = tipo
    osc.frequency.setValueAtTime(freq, inicio)
    if (ate) osc.frequency.exponentialRampToValueAtTime(ate, inicio + dur)
    g.gain.setValueAtTime(0.0001, inicio)
    g.gain.exponentialRampToValueAtTime(vol, inicio + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, inicio + dur)
    osc.connect(g).connect(this.mestre)
    osc.start(inicio)
    osc.stop(inicio + dur + 0.02)
  }

  /** Estalo curtíssimo de relé/botão. */
  private estalo(inicio: number, vol: number) {
    this.rajada(inicio, 0.018, vol, 4500)
  }

  /** Rajada de ruído com decaimento, filtrada por um passa-faixa. */
  private rajada(inicio: number, dur: number, vol: number, centro: number) {
    if (!this.ctx || !this.mestre || !this.ruido) return
    const fonte = this.ctx.createBufferSource()
    fonte.buffer = this.ruido
    const filtro = this.ctx.createBiquadFilter()
    filtro.type = 'bandpass'
    filtro.frequency.value = centro
    filtro.Q.value = 0.7
    const g = this.ctx.createGain()
    g.gain.setValueAtTime(vol, inicio)
    g.gain.exponentialRampToValueAtTime(0.0001, inicio + dur)
    fonte.connect(filtro).connect(g).connect(this.mestre)
    fonte.start(inicio, Math.random() * 1.5)
    fonte.stop(inicio + dur + 0.02)
  }

  /** Cliquezinho de confirmação ao ligar o interruptor "Sons do rádio". */
  private tique() {
    const t = this.agora()
    if (t !== null) this.estalo(t, 0.1)
  }
}

export const radioAudio = new RadioAudio()
