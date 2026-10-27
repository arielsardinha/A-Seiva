/**
 * O que a Dra. Lis ouve pelo rádio, sintetizado com WebAudio (sem arquivos).
 * Cada camada é um som contínuo ou rítmico que entra e sai com fade; quem decide quais
 * camadas estão no ar é o roteiro (`escuta` em src/data/cena01.ts).
 * Os níveis são baixos: são fundo para atuar, não a mixagem final.
 */
import type { CamadaEscuta } from '../data/cena01'

interface Recursos {
  fontes: AudioScheduledSourceNode[]
  timers: number[]
}

interface Contexto {
  ctx: AudioContext
  /** Nó onde a camada toca; o fade de entrada e saída é feito nele. */
  saida: GainNode
  ruido: AudioBuffer
  recursos: Recursos
}

type Construtor = (c: Contexto) => void

// ---- ferramentas ------------------------------------------------------------

function fonteRuido(c: Contexto): AudioBufferSourceNode {
  const fonte = c.ctx.createBufferSource()
  fonte.buffer = c.ruido
  fonte.loop = true
  fonte.start(0, Math.random() * 1.5)
  c.recursos.fontes.push(fonte)
  return fonte
}

function oscilador(c: Contexto, tipo: OscillatorType, freq: number): OscillatorNode {
  const osc = c.ctx.createOscillator()
  osc.type = tipo
  osc.frequency.value = freq
  osc.start()
  c.recursos.fontes.push(osc)
  return osc
}

function filtro(c: Contexto, tipo: BiquadFilterType, freq: number, q = 0.7): BiquadFilterNode {
  const f = c.ctx.createBiquadFilter()
  f.type = tipo
  f.frequency.value = freq
  f.Q.value = q
  return f
}

function ganho(c: Contexto, valor: number): GainNode {
  const g = c.ctx.createGain()
  g.gain.value = valor
  return g
}

function painel(c: Contexto, pan: number): StereoPannerNode {
  const p = c.ctx.createStereoPanner()
  p.pan.value = pan
  p.connect(c.saida)
  return p
}

/** Executa `acao` em tempos precisos, agendando um pouco à frente (não depende do relógio da página). */
function ritmo(c: Contexto, primeiro: number, intervalo: () => number, acao: (t: number, n: number) => void) {
  let proximo = c.ctx.currentTime + primeiro
  let n = 0
  const id = window.setInterval(() => {
    // aba em segundo plano atrasa o timer: recomeça do agora em vez de disparar tudo de uma vez
    if (proximo < c.ctx.currentTime - 0.1) proximo = c.ctx.currentTime + 0.05
    while (proximo < c.ctx.currentTime + 0.3) {
      acao(proximo, n)
      n += 1
      proximo += intervalo()
    }
  }, 80)
  c.recursos.timers.push(id)
}

/** Pancada grave que desliza de `freq` até `ate` (pisada, pulso, bumbo, pio). */
function golpe(c: Contexto, destino: AudioNode, t: number, freq: number, ate: number, dur: number, vol: number) {
  const osc = c.ctx.createOscillator()
  const g = c.ctx.createGain()
  osc.frequency.setValueAtTime(freq, t)
  osc.frequency.exponentialRampToValueAtTime(ate, t + dur)
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g).connect(destino)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

/** Rajada curta de ruído filtrado (cascalho, estalo de fogo, chimbal). */
function sopro(
  c: Contexto,
  destino: AudioNode,
  t: number,
  tipo: BiquadFilterType,
  freq: number,
  q: number,
  dur: number,
  vol: number,
) {
  const fonte = c.ctx.createBufferSource()
  fonte.buffer = c.ruido
  const f = filtro(c, tipo, freq, q)
  const g = c.ctx.createGain()
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  fonte.connect(f).connect(g).connect(destino)
  fonte.start(t, Math.random() * 1.5)
  fonte.stop(t + dur + 0.02)
}

// ---- as camadas ---------------------------------------------------------------

/** Passos de corrida, ~165 por minuto, alternando esquerda e direita. */
const passos: Construtor = (c) => {
  const lados = [painel(c, -0.3), painel(c, 0.3)]
  ritmo(c, 0.15, () => 0.36 * (0.97 + Math.random() * 0.06), (t, n) => {
    const lado = lados[n % 2] ?? c.saida
    const forca = 0.8 + Math.random() * 0.4
    golpe(c, lado, t, 120, 50, 0.1, 0.5 * forca)
    sopro(c, lado, t, 'bandpass', 700, 0.7, 0.07, 0.35 * forca)
    sopro(c, lado, t + 0.012, 'highpass', 3500, 0.5, 0.035, 0.09 * forca)
  })
}

/** Drone grave: duas serras desafinadas e um sub, com o filtro respirando devagar. */
const drone: Construtor = (c) => {
  const lp = filtro(c, 'lowpass', 170, 3)
  lp.connect(c.saida)
  for (const [tipo, freq, vol] of [
    ['sawtooth', 55, 0.5],
    ['sawtooth', 55.7, 0.5],
    ['sine', 27.5, 0.9],
  ] as const) {
    oscilador(c, tipo, freq).connect(ganho(c, vol)).connect(lp)
  }
  oscilador(c, 'sine', 0.08).connect(ganho(c, 60)).connect(lp.frequency)
}

/** Fogo distante: ronco baixo e estalos aleatórios. */
const fogo: Construtor = (c) => {
  fonteRuido(c).connect(filtro(c, 'lowpass', 260)).connect(ganho(c, 0.55)).connect(c.saida)
  ritmo(c, 0.05, () => 0.02 + Math.random() * 0.22, (t) => {
    sopro(c, c.saida, t, 'highpass', 1500 + Math.random() * 3500, 0.7, 0.008 + Math.random() * 0.03, 0.12 + Math.random() * 0.25)
  })
}

/** Floresta: vento nas folhas, rumor grave e uns pios esparsos. */
const floresta: Construtor = (c) => {
  const vento = ganho(c, 0.5)
  fonteRuido(c).connect(filtro(c, 'bandpass', 1300, 0.5)).connect(vento).connect(c.saida)
  oscilador(c, 'sine', 0.13).connect(ganho(c, 0.25)).connect(vento.gain)
  fonteRuido(c).connect(filtro(c, 'lowpass', 400)).connect(ganho(c, 0.3)).connect(c.saida)
  ritmo(c, 2, () => 3 + Math.random() * 6, (t) => {
    const notas = 2 + Math.floor(Math.random() * 3)
    for (let i = 0; i < notas; i++) {
      golpe(c, c.saida, t + i * 0.11, 2600 + Math.random() * 800, 3400 + Math.random() * 900, 0.07, 0.04)
    }
  })
}

/** Ping de sonar discreto, com eco. */
const sonar: Construtor = (c) => {
  const eco = c.ctx.createDelay(1)
  eco.delayTime.value = 0.34
  const retorno = ganho(c, 0.32)
  eco.connect(retorno).connect(eco)
  eco.connect(c.saida)
  ritmo(c, 1.2, () => 6.5 + Math.random() * 3, (t) => {
    const osc = c.ctx.createOscillator()
    const g = c.ctx.createGain()
    osc.frequency.value = 1250
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.18, t + 0.004)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1)
    osc.connect(g)
    g.connect(c.saida)
    g.connect(eco)
    osc.start(t)
    osc.stop(t + 1.2)
  })
}

/** Rio ao longe: água corrente abafada. */
const rio: Construtor = (c) => {
  const distancia = filtro(c, 'lowpass', 1600)
  distancia.connect(c.saida)
  const corpo = filtro(c, 'bandpass', 600, 0.6)
  fonteRuido(c).connect(corpo).connect(ganho(c, 0.5)).connect(distancia)
  oscilador(c, 'sine', 0.21).connect(ganho(c, 180)).connect(corpo.frequency)
  const brilho = ganho(c, 0.12)
  fonteRuido(c).connect(filtro(c, 'highpass', 1800)).connect(brilho).connect(distancia)
  oscilador(c, 'sine', 0.33).connect(ganho(c, 0.05)).connect(brilho.gain)
}

/** Pulso: coração a 70 batimentos por minuto. */
const pulso: Construtor = (c) => {
  ritmo(c, 0.1, () => 0.86, (t) => {
    golpe(c, c.saida, t, 70, 38, 0.14, 0.7)
    golpe(c, c.saida, t + 0.24, 62, 36, 0.12, 0.5)
  })
}

/** Batida de corrida a 150 bpm: bumbo em todo tempo, chimbal no contratempo, caixa nos tempos 2 e 4. */
const batida: Construtor = (c) => {
  ritmo(c, 0.2, () => 0.2, (t, n) => {
    if (n % 2 === 0) golpe(c, c.saida, t, 150, 45, 0.16, 0.7)
    else sopro(c, c.saida, t, 'highpass', 7000, 0.5, 0.05, 0.14)
    if (n % 4 === 2) sopro(c, c.saida, t, 'bandpass', 1800, 0.8, 0.1, 0.3)
  })
}

const CONSTRUTORES: Record<CamadaEscuta, Construtor> = { passos, drone, fogo, floresta, sonar, rio, pulso, batida }

/** Volume de cada camada (0 a 1) e quanto demora para entrar, em segundos. */
const NIVEL: Record<CamadaEscuta, number> = {
  passos: 0.9,
  drone: 0.06,
  fogo: 0.8,
  floresta: 0.55,
  sonar: 0.9,
  rio: 0.5,
  pulso: 0.8,
  batida: 0.5,
}
const ENTRADA: Partial<Record<CamadaEscuta, number>> = { passos: 3, drone: 4, floresta: 3, rio: 3 }
const ENTRADA_PADRAO = 1.2
const SAIDA = 1.2

/** Camadas que tocam por um tempo e se encerram sozinhas (o final da cena não fica em loop). */
const DURACAO_MAXIMA: Partial<Record<CamadaEscuta, number>> = { pulso: 14, batida: 14 }

interface NoAr {
  saida: GainNode
  recursos: Recursos
  limite?: number
}

export class Camadas {
  private noAr = new Map<CamadaEscuta, NoAr>()
  private esgotadas = new Set<CamadaEscuta>()

  constructor(
    private readonly ctx: AudioContext,
    private readonly destino: AudioNode,
    private readonly ruido: AudioBuffer,
  ) {}

  /** Deixa no ar exatamente estas camadas: entram as que faltam, saem as que sobram. */
  definir(ids: Iterable<CamadaEscuta>) {
    const desejadas = new Set(ids)
    for (const id of [...this.noAr.keys()]) if (!desejadas.has(id)) this.parar(id, SAIDA)
    for (const id of [...this.esgotadas]) if (!desejadas.has(id)) this.esgotadas.delete(id)
    for (const id of desejadas) if (!this.noAr.has(id) && !this.esgotadas.has(id)) this.iniciar(id)
  }

  private iniciar(id: CamadaEscuta) {
    const t = this.ctx.currentTime
    const saida = this.ctx.createGain()
    saida.gain.setValueAtTime(0, t)
    saida.gain.linearRampToValueAtTime(NIVEL[id], t + (ENTRADA[id] ?? ENTRADA_PADRAO))
    saida.connect(this.destino)

    const recursos: Recursos = { fontes: [], timers: [] }
    CONSTRUTORES[id]({ ctx: this.ctx, saida, ruido: this.ruido, recursos })

    const entrada: NoAr = { saida, recursos }
    const maximo = DURACAO_MAXIMA[id]
    if (maximo) {
      entrada.limite = window.setTimeout(() => {
        this.parar(id, 2)
        this.esgotadas.add(id)
      }, maximo * 1000)
    }
    this.noAr.set(id, entrada)
  }

  private parar(id: CamadaEscuta, fade: number) {
    const camada = this.noAr.get(id)
    if (!camada) return
    this.noAr.delete(id)
    camada.recursos.timers.forEach((timer) => window.clearInterval(timer))
    window.clearTimeout(camada.limite)

    const t = this.ctx.currentTime
    const { gain } = camada.saida
    gain.cancelScheduledValues(t)
    gain.setValueAtTime(gain.value, t)
    gain.linearRampToValueAtTime(0, t + fade)
    window.setTimeout(() => {
      camada.recursos.fontes.forEach((fonte) => {
        try {
          fonte.stop()
        } catch {
          // já parou
        }
      })
      camada.saida.disconnect()
    }, (fade + 0.2) * 1000)
  }
}
