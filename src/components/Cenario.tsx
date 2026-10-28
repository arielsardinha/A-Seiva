import type { ReactNode } from 'react'
import { AMBIENTES, VISTAS_ESCUTA, type Ambiente, type CamadaEscuta } from '../data/cena01'

// =============================================================================
//  Onde o corredor está: a imagem atrás do rádio. Tudo em SVG (sem arquivos),
//  num quadro de 1600 × 1000 que cobre o painel inteiro ("slice").
//  As animações ficam em styles/cenario.css e param com "menos movimento".
// =============================================================================

interface CenarioProps {
  ambiente: Ambiente
  /** O que está em volta do corredor na mata (a `escuta` do take). */
  camadas: readonly CamadaEscuta[]
  /** A transmissão terminou: só o pulso e a corrida. */
  fim: boolean
  /** A transmissão caiu em vez de encerrar (cena 3): só estática. */
  sinalPerdido?: boolean
  /** O que a legenda diz depois do último take, se a cena tiver um texto próprio. */
  textoFim?: string
}

/** Sorteio com semente: o desenho sai igual a cada render. */
function sorteador(semente: number) {
  let s = semente
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const L = 1600
const A = 1000

/** Estrelas do céu (x, y, raio, se pisca). */
const ESTRELAS = (() => {
  const r = sorteador(7)
  return Array.from({ length: 90 }, () => ({
    x: r() * L,
    y: r() * 470,
    raio: 0.8 + r() * 1.8,
    pisca: r() < 0.3,
    atraso: r() * 4,
  }))
})()

/**
 * Silhueta de copas ao longo do horizonte. `alturaBorda` deixa as árvores mais altas nas laterais,
 * como numa estrada que corta a mata.
 */
function copas(semente: number, base: number, altura: number, alturaBorda: number): string {
  const r = sorteador(semente)
  let x = -20
  let d = `M -20 ${A} L -20 ${base}`
  while (x < L + 20) {
    const largura = 40 + r() * 70
    const lateral = Math.abs(x + largura / 2 - L / 2) / (L / 2)
    const topo = base - altura - lateral * lateral * alturaBorda - r() * altura * 0.8
    d += ` Q ${x + largura / 2} ${topo - largura * 0.35} ${x + largura} ${base - lateral * lateral * alturaBorda * 0.7}`
    x += largura
  }
  return `${d} L ${L + 20} ${A} Z`
}

const COPAS_LONGE = copas(3, 520, 30, 40)
const COPAS_PERTO = copas(11, 540, 20, 330)

function Ceu({ lua = true }: { lua?: boolean }) {
  return (
    <>
      <rect width={L} height={A} fill="url(#cen-ceu)" />
      {lua ? (
        <g className="cen-lua">
          <circle cx="560" cy="200" r="110" fill="url(#cen-halo)" />
          <circle cx="560" cy="200" r="34" fill="#e8efe2" />
          <circle cx="576" cy="190" r="31" fill="#0a1420" />
        </g>
      ) : null}
      {ESTRELAS.map((e, i) => (
        <circle
          key={i}
          className={e.pisca ? 'cen-estrela cen-estrela--pisca' : 'cen-estrela'}
          cx={e.x}
          cy={e.y}
          r={e.raio}
          style={e.pisca ? { animationDelay: `${e.atraso}s` } : undefined}
        />
      ))}
    </>
  )
}

function Defs() {
  return (
    <defs>
      <linearGradient id="cen-ceu" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#03070d" />
        <stop offset="0.5" stopColor="#0a1420" />
        <stop offset="0.62" stopColor="#1c2c38" />
      </linearGradient>
      <radialGradient id="cen-halo">
        <stop offset="0" stopColor="#d9e6ff" stopOpacity="0.28" />
        <stop offset="1" stopColor="#d9e6ff" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="cen-terra" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1b140c" />
        <stop offset="1" stopColor="#5e4629" />
      </linearGradient>
      <radialGradient id="cen-farol" cx="0.5" cy="0.55" r="0.5">
        <stop offset="0" stopColor="#ffd99a" stopOpacity="0.8" />
        <stop offset="0.6" stopColor="#ffcf86" stopOpacity="0.26" />
        <stop offset="1" stopColor="#ffcf86" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="cen-painel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#171c19" />
        <stop offset="0.25" stopColor="#0b0e0c" />
        <stop offset="1" stopColor="#050706" />
      </linearGradient>
      <linearGradient id="cen-facho" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f4fbff" stopOpacity="0.7" />
        <stop offset="1" stopColor="#f4fbff" stopOpacity="0.06" />
      </linearGradient>
      <radialGradient id="cen-lanterna">
        <stop offset="0" stopColor="#ff3a24" stopOpacity="0.9" />
        <stop offset="1" stopColor="#ff3a24" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="cen-fogo">
        <stop offset="0" stopColor="#ff8a2a" stopOpacity="0.75" />
        <stop offset="0.5" stopColor="#ff5a1a" stopOpacity="0.25" />
        <stop offset="1" stopColor="#ff5a1a" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="cen-mata" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#02060a" />
        <stop offset="0.55" stopColor="#0b1a17" />
        <stop offset="1" stopColor="#030806" />
      </linearGradient>
      <linearGradient id="cen-chao" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#081310" />
        <stop offset="1" stopColor="#010302" />
      </linearGradient>
      <linearGradient id="cen-rio" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2c5480" />
        <stop offset="1" stopColor="#11253c" />
      </linearGradient>
      <radialGradient id="cen-nevoa">
        <stop offset="0" stopColor="#cfe8e0" stopOpacity="0.1" />
        <stop offset="1" stopColor="#cfe8e0" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="cen-vinheta" cx="0.5" cy="0.5" r="0.75">
        <stop offset="0.55" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.85" />
      </radialGradient>
      <radialGradient id="cen-vinheta-alerta" cx="0.5" cy="0.5" r="0.75">
        <stop offset="0.5" stopColor="#ff2a10" stopOpacity="0" />
        <stop offset="1" stopColor="#ff2a10" stopOpacity="0.35" />
      </radialGradient>
      <radialGradient id="cen-vinheta-alarme" cx="0.5" cy="0.45" r="0.7">
        <stop offset="0.3" stopColor="#ff1a08" stopOpacity="0" />
        <stop offset="1" stopColor="#ff1a08" stopOpacity="0.6" />
      </radialGradient>
      <linearGradient id="cen-patio" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#15120c" />
        <stop offset="1" stopColor="#3a2e1d" />
      </linearGradient>
      <radialGradient id="cen-halo-amarelo">
        <stop offset="0" stopColor="#ffd99a" stopOpacity="0.4" />
        <stop offset="1" stopColor="#ffd99a" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="cen-calor" cx="0.5" cy="0.5" r="0.75">
        <stop offset="0.5" stopColor="#ff7a1a" stopOpacity="0" />
        <stop offset="1" stopColor="#ff7a1a" stopOpacity="0.4" />
      </radialGradient>
      <pattern id="cen-tela" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <path d="M 0 0 H 16 M 0 0 V 16" fill="none" stroke="#5c6b62" strokeWidth="1.6" />
      </pattern>
      <clipPath id="cen-chao-aceso">
        <path d="M 1000 640 L 1600 640 L 1600 1000 L 700 1000 Z" />
      </clipPath>
      {/* câmera térmica: frio é escuro e azul, quente é branco */}
      <linearGradient id="cen-ir-fundo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#060316" />
        <stop offset="0.55" stopColor="#170a38" />
        <stop offset="1" stopColor="#2a0f4a" />
      </linearGradient>
      <linearGradient id="cen-ir-escala" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.2" stopColor="#ffe066" />
        <stop offset="0.45" stopColor="#ff7a1a" />
        <stop offset="0.7" stopColor="#b0103a" />
        <stop offset="1" stopColor="#170a38" />
      </linearGradient>
      <radialGradient id="cen-quente">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.35" stopColor="#ffe066" />
        <stop offset="0.7" stopColor="#ff7a1a" stopOpacity="0.85" />
        <stop offset="1" stopColor="#b0103a" stopOpacity="0" />
      </radialGradient>
      <pattern id="cen-linhas" width="8" height="4" patternUnits="userSpaceOnUse">
        <rect width="8" height="1.5" fill="#000" />
      </pattern>
      <filter id="cen-borrao" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" />
      </filter>
      <filter id="cen-borrao-forte" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="14" />
      </filter>
    </defs>
  )
}

// ---- drone -----------------------------------------------------------------------

/** Silhueta de drone de quatro rotores, centrada em (0, 0). */
function Drone({ escala = 1, farol = false }: { escala?: number; farol?: boolean }) {
  return (
    <g transform={`scale(${escala})`}>
      <g stroke="#050708" strokeWidth="6" strokeLinecap="round">
        <line x1="-46" y1="-10" x2="46" y2="10" />
        <line x1="-46" y1="10" x2="46" y2="-10" />
      </g>
      <ellipse rx="34" ry="11" fill="#080b0c" />
      {[-50, 50].map((x) => (
        <g key={x}>
          <ellipse className="cen-rotor" cx={x} cy="-12" rx="26" ry="3" fill="#2a3134" opacity="0.6" />
          <ellipse className="cen-rotor" cx={x} cy="12" rx="26" ry="3" fill="#2a3134" opacity="0.6" />
        </g>
      ))}
      {farol ? (
        <>
          <circle cy="16" r="60" fill="url(#cen-halo)" />
          <circle cy="14" r="9" fill="#f4fbff" />
        </>
      ) : null}
      <circle className="cen-pisca-vermelho" cx="0" cy="9" r="4" fill="#ff2a1a" />
      <circle className="cen-pisca-vermelho" cx="0" cy="9" r="16" fill="url(#cen-lanterna)" />
    </g>
  )
}

// ---- dentro da caminhonete ---------------------------------------------------------

const VOLANTE = { x: 380, y: 960, r: 260 }
const naRoda = (graus: number) => ({
  x: VOLANTE.x + VOLANTE.r * Math.cos((graus * Math.PI) / 180),
  y: VOLANTE.y + VOLANTE.r * Math.sin((graus * Math.PI) / 180),
})

function MaoNoVolante({ graus, cotovelo }: { graus: number; cotovelo: { x: number; y: number } }) {
  const mao = naRoda(graus)
  return (
    <g>
      {/* manga da camisa xadrez, apagada pela noite */}
      <path
        d={`M ${mao.x - 34} ${mao.y + 10} L ${cotovelo.x - 70} ${cotovelo.y} L ${cotovelo.x + 70} ${cotovelo.y} L ${mao.x + 30} ${mao.y + 26} Z`}
        fill="#1d2a24"
      />
      <path
        d={`M ${mao.x - 20} ${mao.y + 18} L ${cotovelo.x - 30} ${cotovelo.y} M ${mao.x + 8} ${mao.y + 24} L ${cotovelo.x + 20} ${cotovelo.y}`}
        stroke="#2a3a32"
        strokeWidth="6"
      />
      <ellipse
        cx={mao.x}
        cy={mao.y}
        rx="46"
        ry="34"
        fill="#4a3123"
        transform={`rotate(${graus + 90} ${mao.x} ${mao.y})`}
      />
      <ellipse
        cx={mao.x - 6}
        cy={mao.y - 8}
        rx="28"
        ry="14"
        fill="#5e3f2c"
        transform={`rotate(${graus + 90} ${mao.x} ${mao.y})`}
      />
    </g>
  )
}

function Interior({ ambiente }: { ambiente: Ambiente }) {
  const vp = { x: 800, y: 505 }
  return (
    <g className="cen-interior">
      <Ceu />
      <path d={COPAS_LONGE} fill="#0a1512" />
      <path d={COPAS_PERTO} fill="#050b08" />

      {/* estrada de terra, iluminada pelos faróis; do banco do passageiro, a pista fica à esquerda */}
      <g transform="translate(-180 0)">
        <path d={`M ${vp.x - 10} ${vp.y} L ${vp.x + 10} ${vp.y} L 1460 ${A} L 140 ${A} Z`} fill="url(#cen-terra)" />
        <ellipse cx="800" cy="585" rx="470" ry="120" fill="url(#cen-farol)" />
        <path d={`M ${vp.x - 2} ${vp.y} L ${vp.x + 2} ${vp.y} L 860 ${A} L 740 ${A} Z`} fill="#2c3a1d" opacity="0.75" />
        <g className="cen-sulcos" fill="none" stroke="#7a6346" strokeLinecap="round">
          <path d={`M ${vp.x - 6} ${vp.y} L 470 ${A}`} strokeWidth="5" strokeDasharray="10 46" />
          <path d={`M ${vp.x + 6} ${vp.y} L 1130 ${A}`} strokeWidth="5" strokeDasharray="10 46" />
          <path d={`M ${vp.x - 14} ${vp.y} L 150 ${A}`} strokeWidth="9" strokeDasharray="18 90" stroke="#24331c" />
          <path d={`M ${vp.x + 14} ${vp.y} L 1450 ${A}`} strokeWidth="9" strokeDasharray="18 90" stroke="#24331c" />
        </g>

        {ambiente === 'zumbido' ? (
          <g className="cen-drone-longe">
            <circle r="22" fill="url(#cen-halo)" />
            <circle className="cen-pisca-branco" r="3.5" fill="#f4fbff" />
            <circle className="cen-pisca-vermelho" cx="7" r="3" fill="#ff2a1a" />
          </g>
        ) : null}

        {ambiente === 'holofote' ? (
          <>
            <g className="cen-facho">
              <path d="M 880 200 L 1230 1000 L 530 1000 Z" fill="url(#cen-facho)" />
            </g>
            <g transform="translate(880 190)">
              <Drone escala={1.1} farol />
            </g>
          </>
        ) : null}
      </g>

      {/* capô */}
      <path d="M 120 640 L 150 606 Q 800 548 1450 606 L 1480 640 Z" fill="#0b0f0d" />
      <path d="M 260 600 Q 800 556 1340 600" fill="none" stroke="#1e2622" strokeWidth="3" />

      {/* cabine: tudo menos o para-brisa */}
      <path
        fillRule="evenodd"
        fill="#050707"
        d={`M 0 0 H ${L} V ${A} H 0 Z M 250 118 Q 800 92 1350 118 L 1474 612 Q 800 640 126 612 Z`}
      />
      <path
        d="M 250 118 Q 800 92 1350 118 L 1474 612 Q 800 640 126 612 Z"
        fill="none"
        stroke="#17201c"
        strokeWidth="12"
      />

      {/* retrovisor e o terço pendurado */}
      <rect x="796" y="88" width="8" height="34" fill="#0a0d0c" />
      <rect x="715" y="118" width="170" height="50" rx="12" fill="#0a0d0c" stroke="#1d2622" strokeWidth="3" />
      <rect x="728" y="128" width="144" height="30" rx="7" fill="#141c22" />
      <g className="cen-terco">
        {Array.from({ length: 9 }, (_, i) => (
          <circle key={i} cx="800" cy={174 + i * 10} r="3.6" fill="#6b5a3a" />
        ))}
        <path d="M 800 262 V 292 M 790 272 H 810" stroke="#8a7650" strokeWidth="4" strokeLinecap="round" />
      </g>

      {/* painel */}
      <path d={`M 0 650 Q 800 606 ${L} 650 V ${A} H 0 Z`} fill="url(#cen-painel)" />
      <path d={`M 0 650 Q 800 606 ${L} 650`} fill="none" stroke="#252e29" strokeWidth="4" />

      {/* relógios atrás do volante */}
      {[300, 462].map((x) => (
        <g key={x}>
          <circle cx={x} cy="735" r="50" fill="#0a0c0b" stroke="#1f2622" strokeWidth="4" />
          <path
            d={`M ${x - 36} 755 A 40 40 0 1 1 ${x + 36} 755`}
            fill="none"
            stroke="#c98a1c"
            strokeWidth="3"
            opacity="0.7"
          />
          <line
            x1={x}
            y1="735"
            x2={x + (x === 300 ? -22 : 26)}
            y2="712"
            stroke="#ff9e2a"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </g>
      ))}

      {/* rádio AM do painel */}
      <g>
        <rect x="690" y="712" width="220" height="70" rx="8" fill="#0d100f" stroke="#252e29" strokeWidth="3" />
        <rect className="cen-am" x="704" y="726" width="130" height="30" rx="3" fill="#2a1b04" />
        <text className="cen-am__texto" x="769" y="748" textAnchor="middle">
          {ambiente === 'zumbido' || ambiente === 'holofote' ? '- - - -' : 'AM 1050'}
        </text>
        <circle cx="866" cy="741" r="14" fill="#151a18" stroke="#2c3631" strokeWidth="3" />
      </g>

      {/* volante e as mãos do Dito */}
      <circle cx={VOLANTE.x} cy={VOLANTE.y} r={VOLANTE.r} fill="none" stroke="#0e1211" strokeWidth="40" />
      <circle cx={VOLANTE.x} cy={VOLANTE.y} r={VOLANTE.r - 18} fill="none" stroke="#1a201d" strokeWidth="3" />
      <g stroke="#0e1211" strokeWidth="34">
        <line x1={VOLANTE.x} y1={VOLANTE.y} x2={naRoda(200).x} y2={naRoda(200).y} />
        <line x1={VOLANTE.x} y1={VOLANTE.y} x2={naRoda(340).x} y2={naRoda(340).y} />
      </g>
      <circle cx={VOLANTE.x} cy={VOLANTE.y} r="72" fill="#0c100e" stroke="#1d2420" strokeWidth="4" />
      <MaoNoVolante graus={212} cotovelo={{ x: 70, y: A + 20 }} />
      <MaoNoVolante graus={328} cotovelo={{ x: 520, y: A + 20 }} />

      {ambiente === 'holofote' ? <rect className="cen-clarao" width={L} height={A} fill="#eaf6ff" /> : null}
    </g>
  )
}

// ---- a caminhonete vai embora -------------------------------------------------------

function Partida() {
  return (
    <g>
      <Ceu />
      <path d={COPAS_LONGE} fill="#0a1512" />
      <path d={copas(5, 545, 26, 120)} fill="#060d0a" />
      <g transform="translate(-200 0)">
        <path d="M 790 520 L 810 520 L 1320 1000 L 280 1000 Z" fill="url(#cen-terra)" opacity="0.8" />
        <path d="M 799 520 L 801 520 L 850 1000 L 750 1000 Z" fill="#202b17" opacity="0.7" />

        <g className="cen-poeira" opacity="0">
          {[
            [720, 860, 160],
            [880, 870, 180],
            [800, 820, 220],
          ].map(([x, y, r]) => (
            <circle key={x} cx={x} cy={y} r={r} fill="#6b5840" opacity="0.25" filter="url(#cen-borrao-forte)" />
          ))}
        </g>

        {/* traseira da caminhonete, com o Dito na janela */}
        <g className="cen-caminhonete">
          <ellipse cx="800" cy="890" rx="270" ry="22" fill="#000" opacity="0.6" />
          <rect x="625" y="600" width="350" height="110" rx="18" fill="#101412" />
          <rect x="652" y="616" width="296" height="70" rx="8" fill="#1a2420" />
          <path d="M 760 686 Q 760 640 800 636 Q 842 640 842 686 Z" fill="#070a09" />
          <ellipse cx="801" cy="634" rx="40" ry="10" fill="#070a09" />
          <rect x="560" y="700" width="480" height="120" rx="8" fill="#141917" />
          <line x1="575" y1="740" x2="1025" y2="740" stroke="#0b0e0d" strokeWidth="4" />
          <rect x="760" y="772" width="80" height="24" rx="3" fill="#2c312e" />
          <rect x="548" y="814" width="504" height="28" rx="6" fill="#0c0f0e" />
          <rect x="582" y="836" width="104" height="60" rx="10" fill="#040505" />
          <rect x="914" y="836" width="104" height="60" rx="10" fill="#040505" />
          {[574, 992].map((x) => (
            <g key={x}>
              <rect x={x} y="706" width="34" height="58" rx="4" fill="#ff2a1a" />
              <ellipse cx={x + 17} cy="735" rx="70" ry="60" fill="url(#cen-lanterna)" />
            </g>
          ))}
        </g>

        <g className="cen-drone-segue">
          <path d="M 0 10 L 120 520 L -120 520 Z" fill="url(#cen-facho)" opacity="0.35" />
          <Drone escala={0.9} farol />
        </g>
      </g>

      {/* a beira da mata, onde o corredor ficou */}
      <path d="M 0 0 H 150 Q 120 400 170 1000 H 0 Z" fill="#030605" />
      <path d="M 1600 0 H 1440 Q 1480 420 1420 1000 H 1600 Z" fill="#030605" />
      <path d="M 0 860 Q 120 780 260 870 Q 320 800 420 1000 H 0 Z" fill="#040907" />
      <path d="M 1600 870 Q 1480 790 1360 880 Q 1300 820 1200 1000 H 1600 Z" fill="#040907" />
      {[
        [210, 930],
        [260, 958],
        [1340, 944],
      ].map(([x, y]) => (
        <circle key={x} className="cen-fungo" cx={x} cy={y} r="4" fill="#6dffcf" filter="url(#cen-borrao)" />
      ))}
    </g>
  )
}

// ---- correndo na mata ---------------------------------------------------------------

interface Tronco {
  x: number
  largura: number
  topo: number
  base: number
  curva: number
}

function troncos(semente: number, quantos: number, largura: [number, number], base: [number, number]): Tronco[] {
  const r = sorteador(semente)
  return Array.from({ length: quantos }, (_, i) => ({
    x: (i + r() * 0.8) * (L / quantos),
    largura: largura[0] + r() * (largura[1] - largura[0]),
    topo: -40,
    base: base[0] + r() * (base[1] - base[0]),
    curva: (r() - 0.5) * 40,
  }))
}

const TRONCOS_LONGE = troncos(21, 26, [8, 22], [640, 700])
const TRONCOS_MEIO = troncos(22, 11, [30, 62], [800, 860])
const TRONCOS_PERTO = troncos(23, 4, [130, 210], [A + 40, A + 40])

/** Pontinhos verdes no chão: os fungos que acendem (a pista do Dito). */
const FUNGOS = (() => {
  const r = sorteador(31)
  return Array.from({ length: 26 }, () => ({
    x: r() * L,
    y: 830 + r() * 120,
    raio: 2 + r() * 3,
    atraso: r() * 5,
  }))
})()

const SAMAMBAIAS = (() => {
  const r = sorteador(41)
  return Array.from({ length: 9 }, (_, i) => ({
    x: (i + r()) * (L / 9),
    altura: 90 + r() * 90,
    abertura: 60 + r() * 60,
  }))
})()

/** A rede de fungos debaixo das raízes, que acende de noite (a calmaria da cena 3). */
const RAIZES = (() => {
  const r = sorteador(71)
  return Array.from({ length: 22 }, (_, i) => {
    const x = (i + r()) * (L / 22)
    const y = 800 + r() * 110
    const lado = r() < 0.5 ? -1 : 1
    const comprimento = 140 + r() * 180
    const fim = x + lado * comprimento
    const curva = (r() - 0.5) * 60
    const galho = x + lado * comprimento * (0.3 + r() * 0.3)
    return {
      d: `M ${x} ${y} Q ${(x + fim) / 2} ${y + curva} ${fim} ${y + curva * 0.4 + 20}`,
      galho: `M ${galho} ${y + curva * 0.45} Q ${galho + lado * 40} ${y + 40} ${galho + lado * 90} ${y + 70 + r() * 30}`,
      atraso: r() * 1.2,
    }
  })
})()

function RaizesAcesas() {
  return (
    <g className="cen-raizes" fill="none" stroke="#6dffcf" strokeLinecap="round">
      {RAIZES.map((raiz, i) => (
        <g key={i} className="cen-raiz" style={{ animationDelay: `${raiz.atraso}s` }}>
          {/* o brilho borrado por baixo e um fio fino e nítido por cima */}
          <g filter="url(#cen-borrao)">
            <path d={raiz.d} strokeWidth="9" />
            <path d={raiz.galho} strokeWidth="6" />
          </g>
          <path d={raiz.d} strokeWidth="1.6" stroke="#c8fff0" />
          <path d={raiz.galho} strokeWidth="1.2" stroke="#c8fff0" />
        </g>
      ))}
    </g>
  )
}

function caminhoTronco(t: Tronco): string {
  const meio = t.largura / 2
  return `M ${t.x - meio} ${t.base} Q ${t.x - meio + t.curva} ${(t.base + t.topo) / 2} ${t.x - meio * 0.7} ${t.topo} L ${t.x + meio * 0.7} ${t.topo} Q ${t.x + meio + t.curva} ${(t.base + t.topo) / 2} ${t.x + meio} ${t.base} Z`
}

/** Uma faixa de troncos repetida duas vezes, para rolar sem emenda. */
function Faixa({
  lista,
  cor,
  classe,
  children,
}: {
  lista: Tronco[]
  cor: string
  classe: string
  children?: ReactNode
}) {
  const conteudo = (
    <>
      {lista.map((t, i) => (
        <path key={i} d={caminhoTronco(t)} fill={cor} />
      ))}
      {children}
    </>
  )
  return (
    <g className={classe}>
      {conteudo}
      <g transform={`translate(${L} 0)`}>{conteudo}</g>
    </g>
  )
}

interface MataProps {
  camadas: readonly CamadaEscuta[]
  fim: boolean
  /** A malha fantasma descendo do céu (cena 2). */
  malha?: boolean
  /** O chão aceso: a rede de fungos brilhando entre as raízes (cena 3). */
  raizes?: boolean
  /** O alarme do bunker, ouvido pelo rádio: a tela pisca em vermelho. */
  alarme?: boolean
  /** O Drone Predador em cima da copa (cena 4): chegando, com o laser varrendo, ou com a mira travada. */
  predador?: 'chegando' | 'mira'
  /** As duas pedras gigantes da ravina, chegando perto (cena 5). */
  pedras?: boolean
}

function Mata({ camadas, fim, malha = false, raizes = false, alarme = false, predador, pedras = false }: MataProps) {
  const tem = (c: CamadaEscuta) => camadas.includes(c)
  return (
    <g>
      <rect width={L} height={A} fill="url(#cen-mata)" />
      <circle cx="600" cy="120" r="300" fill="url(#cen-halo)" />

      {tem('fogo') ? (
        <g className="cen-fogo">
          <ellipse cx="430" cy="610" rx="520" ry="250" fill="url(#cen-fogo)" />
        </g>
      ) : null}

      {tem('rio') ? (
        <g className="cen-rio">
          <rect x="0" y="610" width={L} height="70" fill="url(#cen-rio)" />
          {Array.from({ length: 14 }, (_, i) => (
            <rect
              key={i}
              className="cen-rio__brilho"
              x={380 + ((i * 97) % 560)}
              y={620 + ((i * 23) % 50)}
              width={30 + ((i * 37) % 50)}
              height="3"
              rx="1.5"
              fill="#c9ddff"
              style={{ animationDelay: `${(i % 5) * 0.4}s` }}
            />
          ))}
        </g>
      ) : null}

      {tem('sonar') ? (
        <g className="cen-sonar" fill="none" stroke="#7fd6ff">
          <circle className="cen-sonar__onda" cx="700" cy="640" r="200" />
          <circle className="cen-sonar__onda cen-sonar__onda--2" cx="700" cy="640" r="200" />
        </g>
      ) : null}

      <Faixa lista={TRONCOS_LONGE} cor="#122520" classe="cen-faixa cen-faixa--longe" />
      <ellipse className="cen-nevoa" cx="600" cy="690" rx="900" ry="110" fill="url(#cen-nevoa)" />

      <path d="M 0 790 Q 400 760 800 790 T 1600 790 V 1000 H 0 Z" fill="url(#cen-chao)" />
      {raizes ? (
        <Faixa lista={[]} cor="none" classe="cen-faixa cen-faixa--meio">
          <RaizesAcesas />
        </Faixa>
      ) : null}

      <Faixa lista={TRONCOS_MEIO} cor="#0a1612" classe="cen-faixa cen-faixa--meio">
        {FUNGOS.map((f, i) => (
          <circle
            key={i}
            className="cen-fungo"
            cx={f.x}
            cy={f.y}
            r={f.raio}
            fill="#6dffcf"
            filter="url(#cen-borrao)"
            style={{ animationDelay: `${f.atraso}s` }}
          />
        ))}
      </Faixa>

      {/* raios de lua entre as copas */}
      <g className="cen-raios" fill="#dfeeff">
        <path d="M 540 60 L 620 60 L 520 820 L 380 820 Z" opacity="0.06" />
        <path d="M 660 50 L 700 50 L 760 720 L 690 720 Z" opacity="0.05" />
      </g>

      {/* copa por cima de tudo */}
      <path d={copasInvertidas} fill="#020504" className={predador ? 'cen-copa-vento' : undefined} />
      {/* o drone voa acima da copa e o facho atravessa as folhas */}
      {tem('drone') ? (
        <g className="cen-drone-copa">
          <g className="cen-facho cen-facho--mata">
            <path d="M 600 60 L 900 900 L 300 900 Z" fill="url(#cen-facho)" opacity="0.45" />
          </g>
          <g transform="translate(600 52)">
            <Drone escala={0.8} farol />
          </g>
        </g>
      ) : null}
      {malha ? <Malha /> : null}

      {pedras ? <PedrasDaRavina /> : null}

      <Faixa lista={TRONCOS_PERTO} cor="#020403" classe="cen-faixa cen-faixa--perto">
        {SAMAMBAIAS.map((s, i) => (
          <path
            key={i}
            d={`M ${s.x} ${A} Q ${s.x - s.abertura} ${A - s.altura} ${s.x - s.abertura * 1.6} ${A - s.altura * 0.6} M ${s.x} ${A} Q ${s.x + s.abertura} ${A - s.altura} ${s.x + s.abertura * 1.6} ${A - s.altura * 0.55} M ${s.x} ${A} Q ${s.x} ${A - s.altura * 1.2} ${s.x + 20} ${A - s.altura * 1.3}`}
            fill="none"
            stroke="#030806"
            strokeWidth="14"
            strokeLinecap="round"
          />
        ))}
      </Faixa>

      {/* o Predador fica na frente dos troncos de perto, senão some atrás deles */}
      {predador ? <Predador mira={predador === 'mira'} /> : null}
      {tem('drone') ? <rect width={L} height={A} fill="url(#cen-vinheta-alerta)" className="cen-alerta" /> : null}
      {alarme && !fim ? <rect width={L} height={A} fill="url(#cen-vinheta-alarme)" className="cen-alarme" /> : null}
      {fim ? <rect width={L} height={A} fill="url(#cen-vinheta)" className="cen-pulso" /> : null}
    </g>
  )
}

/** Onde o Drone Predador paira: abaixo da legenda e à esquerda do rádio, para aparecer no painel. */
const PREDADOR = { x: 640, y: 250 }
/** Onde a mira trava: a mochila do corredor, embaixo, à esquerda do rádio. */
const ALVO = { x: 560, y: 930 }

/** O Drone Predador: grande, escuro, com um laser vermelho que varre o chão ou trava na mochila. */
function Predador({ mira }: { mira: boolean }) {
  return (
    <g>
      <g
        className={mira ? 'cen-laser cen-laser--travado' : 'cen-laser'}
        style={{ transformOrigin: `${PREDADOR.x}px ${PREDADOR.y}px` }}
      >
        <line
          x1={PREDADOR.x}
          y1={PREDADOR.y + 20}
          x2={ALVO.x}
          y2={ALVO.y}
          stroke="#ff2a1a"
          strokeWidth="16"
          opacity="0.45"
          filter="url(#cen-borrao)"
        />
        <line x1={PREDADOR.x} y1={PREDADOR.y + 20} x2={ALVO.x} y2={ALVO.y} stroke="#ff6a58" strokeWidth="3" />
        <circle cx={ALVO.x} cy={ALVO.y} r="10" fill="#ff2a1a" filter="url(#cen-borrao)" />
      </g>
      {mira ? (
        <g
          className="cen-reticula"
          fill="none"
          stroke="#ff4a36"
          strokeWidth="3"
          style={{ transformOrigin: `${ALVO.x}px ${ALVO.y}px` }}
        >
          <circle cx={ALVO.x} cy={ALVO.y} r="46" />
          <path
            d={`M ${ALVO.x - 70} ${ALVO.y} H ${ALVO.x - 24} M ${ALVO.x + 24} ${ALVO.y} H ${ALVO.x + 70} M ${ALVO.x} ${ALVO.y - 70} V ${ALVO.y - 24} M ${ALVO.x} ${ALVO.y + 24} V ${ALVO.y + 70}`}
          />
        </g>
      ) : null}
      <g className={mira ? 'cen-predador cen-predador--parado' : 'cen-predador'}>
        <g transform={`translate(${PREDADOR.x} ${PREDADOR.y})`}>
          {/* a lua por trás recorta a silhueta escura */}
          <circle r="260" fill="url(#cen-halo)" />
          <ellipse rx="210" ry="60" fill="#9fb7d0" opacity="0.22" filter="url(#cen-borrao-forte)" />
          <Drone escala={2.6} />
          {/* os canos da artilharia, embaixo do corpo */}
          <g fill="#050708">
            <rect x="-52" y="26" width="14" height="44" rx="4" />
            <rect x="38" y="26" width="14" height="44" rx="4" />
          </g>
        </g>
      </g>
    </g>
  )
}

// ---- a ravina, a fenda e o barco (cena 5) ---------------------------------------------

/** Onde abre a fenda entre as duas pedras: à esquerda do rádio, para aparecer no painel. */
const FENDA = 570

/** As duas pedras gigantes da ravina, crescendo na frente do corredor enquanto ele corre. */
function PedrasDaRavina() {
  return (
    <g className="cen-aproxima cen-aproxima--ravina" style={{ transformOrigin: `${FENDA}px 820px` }}>
      <path
        d={`M ${FENDA - 14} 860 L ${FENDA - 40} 560 Q ${FENDA - 120} 470 ${FENDA - 260} 500 L ${FENDA - 420} 620 L ${FENDA - 520} 860 Z`}
        fill="#1c2327"
        stroke="#56707c"
        strokeWidth="3"
      />
      <path
        d={`M ${FENDA + 14} 860 L ${FENDA + 34} 580 Q ${FENDA + 110} 450 ${FENDA + 280} 490 L ${FENDA + 470} 640 L ${FENDA + 560} 860 Z`}
        fill="#171d21"
        stroke="#56707c"
        strokeWidth="3"
      />
      {/* o vão escuro entre as duas */}
      <path d={`M ${FENDA - 14} 860 L ${FENDA - 40} 560 L ${FENDA + 34} 580 L ${FENDA + 14} 860 Z`} fill="#000" />
    </g>
  )
}

/** As paredes do desfiladeiro, vistas de dentro da fenda. */
const PAREDE_ESQUERDA = `M 0 0 L ${FENDA - 30} 0 L ${FENDA - 60} 260 L ${FENDA - 20} 480 L ${FENDA - 100} 760 L ${FENDA - 150} ${A} L 0 ${A} Z`
const PAREDE_DIREITA = `M ${FENDA + 70} 0 L ${L} 0 L ${L} ${A} L ${FENDA + 170} ${A} L ${FENDA + 120} 760 L ${FENDA + 60} 480 L ${FENDA + 110} 260 Z`

/** Camadas da rocha, para a parede não ser um bloco liso. */
const ESTRATOS = Array.from({ length: 9 }, (_, i) => 110 + i * 100)

/** Dentro da fenda: paredes de pedra, uma tira de céu e água rasa. Com `fogo`, o Predador queima lá em cima. */
function Fenda({ fogo }: { fogo: boolean }) {
  return (
    <g>
      <Ceu lua={false} />
      {fogo ? (
        <g className="cen-explosao">
          <ellipse cx={FENDA + 20} cy="40" rx="260" ry="200" fill="url(#cen-fogo)" />
        </g>
      ) : null}

      {/* a água rasa no fundo */}
      <rect x="0" y="840" width={L} height="160" fill="url(#cen-rio)" opacity="0.55" />
      {Array.from({ length: 10 }, (_, i) => (
        <rect
          key={i}
          className="cen-rio__brilho"
          x={FENDA - 120 + ((i * 53) % 260)}
          y={860 + ((i * 29) % 120)}
          width={20 + ((i * 31) % 40)}
          height="3"
          rx="1.5"
          fill="#c9ddff"
          style={{ animationDelay: `${(i % 4) * 0.5}s` }}
        />
      ))}

      {[PAREDE_ESQUERDA, PAREDE_DIREITA].map((d) => (
        <g key={d}>
          <path d={d} fill="#0b0f10" />
          <path
            d={d}
            fill="none"
            stroke={fogo ? '#a4532a' : '#34444c'}
            strokeWidth="4"
            className={fogo ? 'cen-explosao' : undefined}
          />
        </g>
      ))}
      <g stroke="#182024" strokeWidth="3" fill="none">
        {ESTRATOS.map((y) => (
          <g key={y}>
            <path d={`M 0 ${y} Q ${FENDA / 2} ${y + 30} ${FENDA - 90} ${y - 10}`} />
            <path d={`M ${FENDA + 140} ${y + 20} Q ${(FENDA + L) / 2} ${y - 20} ${L} ${y + 10}`} />
          </g>
        ))}
      </g>
    </g>
  )
}

/** Galhos caídos pendendo da margem, no alto do quadro. */
const GALHOS = [
  'M 380 -20 Q 470 120 520 260',
  'M 430 -20 Q 560 90 640 180',
  'M 470 120 Q 430 180 410 260',
  'M 560 90 Q 600 160 590 230',
]

/** O barco autônomo descendo o rio: a proa embaixo, a lua refletida na água. */
function Barco() {
  return (
    <g>
      <Ceu />
      <path d={COPAS_LONGE} fill="#06100d" />
      <rect x="0" y="560" width={L} height={A - 560} fill="url(#cen-rio)" />
      {/* o reflexo da lua, tremendo na correnteza */}
      {Array.from({ length: 12 }, (_, i) => (
        <rect
          key={i}
          className="cen-rio__brilho"
          x={530 + ((i * 37) % 60)}
          y={590 + i * 26}
          width={30 + ((i * 17) % 50)}
          height="4"
          rx="2"
          fill="#e8efe2"
          style={{ animationDelay: `${(i % 5) * 0.35}s` }}
        />
      ))}
      <g stroke="#030605" strokeWidth="10" strokeLinecap="round" fill="none">
        {GALHOS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>

      <g transform="translate(0 -120)">
        <g className="cen-barco">
          {/* a esteira abrindo dos dois lados da proa */}
          <g stroke="#9fb7d0" strokeWidth="3" opacity="0.35" fill="none">
            <path d="M 560 820 L 380 1000" />
            <path d="M 640 820 L 820 1000" />
          </g>
          <path
            d="M 400 1130 L 560 830 Q 600 800 640 830 L 800 1130 Z"
            fill="#0a0f12"
            stroke="#34444c"
            strokeWidth="3"
          />
          <circle className="cen-barco__luz" cx="600" cy="880" r="6" fill="#62ff93" />
        </g>
      </g>
    </g>
  )
}

/** O centro da malha fantasma, acima do quadro: dali descem os fios e os anéis da teia. */
const CENTRO_MALHA = { x: 600, y: -160 }

/** A malha fantasma: uma teia térmica descendo do céu, com os Drones Varredores em cima. */
function Malha() {
  return (
    <g>
      <g className="cen-malha" fill="none" stroke="#ff5a3c" strokeWidth="1.6">
        {Array.from({ length: 13 }, (_, i) => {
          const angulo = ((20 + i * 11.7) * Math.PI) / 180
          return (
            <line
              key={i}
              x1={CENTRO_MALHA.x}
              y1={CENTRO_MALHA.y}
              x2={CENTRO_MALHA.x + Math.cos(angulo) * 1700}
              y2={CENTRO_MALHA.y + Math.sin(angulo) * 1700}
            />
          )
        })}
        {[300, 520, 760, 1020, 1300].map((r) => (
          <ellipse key={r} cx={CENTRO_MALHA.x} cy={CENTRO_MALHA.y} rx={r * 1.3} ry={r} />
        ))}
      </g>
      {[
        [470, 40, 0.45],
        [760, 84, 0.4],
        [960, 30, 0.35],
      ].map(([x, y, escala]) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          <Drone escala={escala} />
        </g>
      ))}
    </g>
  )
}

/** A copa vista de baixo: folhas pendendo do alto, com um vão para a lua. */
const copasInvertidas = (() => {
  const r = sorteador(51)
  let d = 'M -20 0'
  let x = -20
  while (x < L + 20) {
    const largura = 50 + r() * 90
    const vao = x > 460 && x < 720
    const fundo = vao ? 40 + r() * 20 : 110 + r() * 110
    d += ` Q ${x + largura / 2} ${fundo + largura * 0.3} ${x + largura} ${vao ? 30 : 80 + r() * 50}`
    x += largura
  }
  return `${d} L ${L + 20} 0 Z`
})()

// ---- Setor 7: o pátio dos mercenários -----------------------------------------------

/** Tocos do desmatamento espalhados no pátio (profundidade de 0, longe, a 1, perto). */
const TOCOS = (() => {
  const r = sorteador(61)
  return Array.from({ length: 16 }, () => ({ x: r() * L, fundo: 0.1 + r() * 0.9 }))
})()

function Tocos({ horizonte, perto }: { horizonte: number; perto: number }) {
  return (
    <g>
      {TOCOS.map((t, i) => {
        const y = horizonte + (perto - horizonte) * t.fundo
        const e = 0.3 + t.fundo * 1.4
        return (
          <g key={i}>
            <ellipse cx={t.x} cy={y} rx={26 * e} ry={7 * e} fill="#000" opacity="0.35" />
            <path
              d={`M ${t.x - 16 * e} ${y} L ${t.x - 12 * e} ${y - 22 * e} L ${t.x + 13 * e} ${y - 24 * e} L ${t.x + 17 * e} ${y} Z`}
              fill="#0d0b08"
            />
            <ellipse cx={t.x + 0.5 * e} cy={y - 23 * e} rx={12.5 * e} ry={4 * e} fill="#3a2e1e" />
          </g>
        )
      })}
    </g>
  )
}

/** Galpão de zinco com a porta de correr entreaberta e uma lâmpada em cima. */
function Galpao({ x, base, largura, altura }: { x: number; base: number; largura: number; altura: number }) {
  const topo = base - altura
  const nervuras = Math.round(largura / 22)
  const porta = { x: x + largura * 0.36, y: base - altura * 0.72, largura: largura * 0.28 }
  return (
    <g>
      <path
        d={`M ${x - largura * 0.05} ${topo} L ${x + largura / 2} ${topo - altura * 0.3} L ${x + largura * 1.05} ${topo} Z`}
        fill="#0c1215"
      />
      <rect x={x} y={topo} width={largura} height={altura} fill="#141c20" />
      <g stroke="#1f2a2f" strokeWidth={Math.max(1.5, largura / 260)}>
        {Array.from({ length: nervuras }, (_, i) => {
          const nx = x + ((i + 0.5) * largura) / nervuras
          return <line key={i} x1={nx} y1={topo} x2={nx} y2={base} />
        })}
      </g>
      <rect x={porta.x} y={porta.y} width={porta.largura} height={base - porta.y} fill="#070a0b" />
      <rect
        x={porta.x + porta.largura * 0.4}
        y={porta.y}
        width={largura * 0.03}
        height={base - porta.y}
        fill="#ffcf86"
        opacity="0.4"
      />
      <circle cx={x + largura / 2} cy={base - altura * 0.8} r={altura * 0.5} fill="url(#cen-halo-amarelo)" />
      <circle cx={x + largura / 2} cy={base - altura * 0.8} r={Math.max(3, altura * 0.025)} fill="#ffe2a8" />
      <rect x={x - 4} y={base - 3} width={largura + 8} height="6" fill="#000" opacity="0.5" />
    </g>
  )
}

/** Onde fica a lâmpada do holofote numa torre (o facho gira em volta desse ponto). */
const lampadaDaTorre = (x: number, base: number, altura: number) => ({ x: x + altura * 0.17, y: base - altura * 0.93 })

/** Torre de vigia de madeira, com a cabine e o holofote. */
function Torre({ x, base, altura }: { x: number; base: number; altura: number }) {
  const cabine = base - altura
  const meia = altura * 0.15
  const lamp = lampadaDaTorre(x, base, altura)
  const traco = Math.max(2, altura * 0.018)
  return (
    <g>
      <g stroke="#0b0f10" strokeWidth={traco * 1.6} strokeLinecap="round">
        <line x1={x - meia * 1.5} y1={base} x2={x - meia} y2={cabine + altura * 0.2} />
        <line x1={x + meia * 1.5} y1={base} x2={x + meia} y2={cabine + altura * 0.2} />
      </g>
      <path
        d={`M ${x - meia * 1.4} ${base - altura * 0.08} L ${x + meia * 1.15} ${base - altura * 0.4} L ${x - meia * 1.1} ${base - altura * 0.62} L ${x + meia} ${cabine + altura * 0.22}`}
        fill="none"
        stroke="#0b0f10"
        strokeWidth={traco}
      />
      <rect x={x - meia * 1.3} y={cabine + altura * 0.06} width={meia * 2.6} height={altura * 0.15} fill="#0b0f10" />
      <rect
        x={x - meia * 0.9}
        y={cabine + altura * 0.09}
        width={meia * 1.8}
        height={altura * 0.035}
        fill="#ff2a1a"
        opacity="0.45"
      />
      <path
        d={`M ${x - meia * 1.6} ${cabine + altura * 0.06} L ${x} ${cabine} L ${x + meia * 1.6} ${cabine + altura * 0.06} Z`}
        fill="#0b0f10"
      />
      <circle cx={lamp.x} cy={lamp.y} r={altura * 0.22} fill="url(#cen-halo)" />
      <circle cx={lamp.x} cy={lamp.y} r={Math.max(4, altura * 0.03)} fill="#f4fbff" />
    </g>
  )
}

/** O facho do holofote, apontado para baixo; o CSS gira em volta da lâmpada (uma ida e volta a cada 30 s). */
function Facho({ x, y, comprimento, abertura }: { x: number; y: number; comprimento: number; abertura: number }) {
  return (
    <g className="cen-holofote" style={{ transformOrigin: `${x}px ${y}px` }}>
      <path
        d={`M ${x - 5} ${y} L ${x + 5} ${y} L ${x + abertura} ${y + comprimento} L ${x - abertura} ${y + comprimento} Z`}
        fill="url(#cen-facho)"
        opacity="0.5"
      />
    </g>
  )
}

/** Cerca de tela com arame em cima e um mourão a cada `vao`. */
function Cerca({
  topo,
  base,
  de,
  ate,
  vao = 130,
}: {
  topo: number
  base: number
  de: number
  ate: number
  vao?: number
}) {
  const altura = base - topo
  return (
    <g>
      <rect x={de} y={topo} width={ate - de} height={altura} fill="url(#cen-tela)" opacity="0.6" />
      <line x1={de} y1={topo} x2={ate} y2={topo} stroke="#3a4640" strokeWidth={Math.max(2, altura * 0.012)} />
      <g stroke="#0a0d0c" strokeWidth={Math.max(4, altura * 0.04)}>
        {Array.from({ length: Math.floor((ate - de) / vao) + 1 }, (_, i) => (
          <line key={i} x1={de + i * vao} y1={topo - altura * 0.08} x2={de + i * vao} y2={base} />
        ))}
      </g>
    </g>
  )
}

/** Câmera térmica da torre: a mata fria e o corredor, um ponto quente correndo em linha reta. */
function Termico() {
  return (
    <g>
      <rect width={L} height={A} fill="url(#cen-ir-fundo)" />
      <path d={COPAS_LONGE} fill="#1d0f4c" />
      <path d="M 0 780 Q 400 750 800 780 T 1600 780 V 1000 H 0 Z" fill="#331358" />
      {TRONCOS_MEIO.map((t, i) => (
        <path key={i} d={caminhoTronco(t)} fill="#120934" />
      ))}

      <g className="cen-alvo">
        <g transform="translate(-110 0)">
          <g filter="url(#cen-borrao)">
            <circle cx="720" cy="600" r="22" fill="url(#cen-quente)" />
            <ellipse cx="720" cy="680" rx="34" ry="70" fill="url(#cen-quente)" />
            <ellipse cx="704" cy="770" rx="14" ry="44" fill="url(#cen-quente)" transform="rotate(14 704 770)" />
            <ellipse cx="738" cy="768" rx="14" ry="44" fill="url(#cen-quente)" transform="rotate(-18 738 768)" />
          </g>
          <path
            d="M 650 560 h 30 M 650 560 v 30 M 790 560 h -30 M 790 560 v 30 M 650 830 h 30 M 650 830 v -30 M 790 830 h -30 M 790 830 v -30"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            opacity="0.85"
          />
          <text className="cen-hud" x="804" y="580">
            36,9 °C
          </text>
        </g>
      </g>

      {/* o visor da câmera */}
      <rect width={L} height={A} fill="url(#cen-linhas)" opacity="0.35" />
      <g fill="none" stroke="#e8e4ff" strokeWidth="3" opacity="0.6">
        <path d="M 430 230 h 70 M 430 230 v 70 M 1170 230 h -70 M 1170 230 v 70 M 430 930 h 70 M 430 930 v -70 M 1170 930 h -70 M 1170 930 v -70" />
      </g>
      <text className="cen-hud" x="470" y="850">
        TORRE 2 · IR
      </text>
      <text className="cen-hud cen-hud--rec" x="470" y="810">
        ● REC
      </text>
      <text className="cen-hud" x="470" y="890">
        SETOR NORTE
      </text>
      <rect x="450" y="330" width="18" height="340" fill="url(#cen-ir-escala)" />
      <text className="cen-hud cen-hud--miudo" x="478" y="346">
        40°
      </text>
      <text className="cen-hud cen-hud--miudo" x="478" y="670">
        10°
      </text>
    </g>
  )
}

/** Da beira da mata: o pátio do Setor 7 do outro lado da cerca rasgada. */
function BeiraDoPatio() {
  const torre = { x: 470, base: 600, altura: 330 }
  const lamp = lampadaDaTorre(torre.x, torre.base, torre.altura)
  return (
    <g>
      <Ceu />
      <path d={copas(13, 545, 22, 30)} fill="#07100d" />
      <rect x="0" y="560" width={L} height="440" fill="url(#cen-patio)" />
      <Tocos horizonte={600} perto={760} />
      <Galpao x={600} base={605} largura={280} altura={110} />
      {/* o portão sul, lá do outro lado */}
      <rect x="1250" y="560" width="22" height="60" fill="#0a0d0c" />
      <rect x="1420" y="560" width="22" height="60" fill="#0a0d0c" />
      <Torre {...torre} />
      <Facho x={lamp.x} y={lamp.y} comprimento={1300} abertura={150} />

      {/* a cerca, com um pedaço caído onde dá pra passar */}
      <Cerca topo={690} base={880} de={-20} ate={520} />
      <Cerca topo={690} base={880} de={650} ate={L + 20} />
      <path d="M 520 880 L 540 760 L 640 800 L 650 880 Z" fill="url(#cen-tela)" opacity="0.5" />

      {/* a mata em volta de quem olha */}
      <path d="M 0 0 H 200 Q 150 420 120 1000 H 0 Z" fill="#020403" />
      <path d={copasInvertidas} fill="#020504" opacity="0.92" />
      <path d="M 0 900 Q 140 820 300 920 Q 380 860 480 1000 H 0 Z" fill="#030806" />
      <path d="M 1600 900 Q 1460 830 1300 930 Q 1240 880 1150 1000 H 1600 Z" fill="#030806" />
      {[
        [180, 960],
        [470, 962],
        [560, 978],
        [1400, 968],
      ].map(([x, y]) => (
        <circle key={x} className="cen-fungo" cx={x} cy={y} r="4" fill="#6dffcf" filter="url(#cen-borrao)" />
      ))}
    </g>
  )
}

/** Atravessando o pátio aberto: o galpão crescendo na frente, o holofote na outra ponta. */
function Patio() {
  const torre = { x: 450, base: 520, altura: 210 }
  const lamp = lampadaDaTorre(torre.x, torre.base, torre.altura)
  return (
    <g>
      <Ceu lua={false} />
      <path d={copas(17, 505, 18, 24)} fill="#07100d" />
      <rect x="0" y="515" width={L} height="485" fill="url(#cen-patio)" />
      <g className="cen-rastros" fill="none" stroke="#4c3d27" strokeLinecap="round">
        {[-500, 150, 1250, 1900].map((x) => (
          <path key={x} d={`M 640 525 L ${x} ${A}`} strokeWidth="8" strokeDasharray="18 90" />
        ))}
      </g>
      <Tocos horizonte={540} perto={960} />
      <Torre {...torre} />
      <g className="cen-aproxima" style={{ transformOrigin: '640px 640px' }}>
        <Galpao x={400} base={640} largura={480} altura={230} />
      </g>
      <Facho x={lamp.x} y={lamp.y} comprimento={1500} abertura={170} />
      <rect width={L} height={A} fill="url(#cen-vinheta-alerta)" className="cen-alerta" />
    </g>
  )
}

/** Parede de zinco em perspectiva: a nervura de perto fica larga, a de longe, apertada. */
const NERVURAS_PAREDE = Array.from({ length: 18 }, (_, i) => {
  const s = 1 - Math.pow(1 - (i + 1) / 19, 2)
  return { x: -40 + 800 * s, topo: -60 + 390 * s, base: 1060 - 420 * s }
})

/** Encostado na parede do galpão, na sombra. A luz do holofote passa no chão ao lado. */
function SombraDoGalpao({ calor }: { calor: boolean }) {
  return (
    <g>
      <Ceu lua={false} />
      {/* espelhado: a parede fica à direita (atrás do rádio) e o chão aceso, à esquerda */}
      <g transform="translate(1450 0) scale(-1 1)">
        <path d={copas(19, 590, 18, 20)} fill="#07100d" />
        <rect x="700" y="630" width="900" height="370" fill="url(#cen-patio)" />
        <Cerca topo={560} base={640} de={760} ate={L + 20} vao={70} />
        <g clipPath="url(#cen-chao-aceso)">
          <g className="cen-luz-chao">
            <path
              d="M 1150 640 L 1260 640 L 1560 1000 L 1290 1000 Z"
              fill="#f4fbff"
              opacity="0.22"
              filter="url(#cen-borrao-forte)"
            />
          </g>
        </g>
        {/* a sombra do galpão no chão, onde o corredor está */}
        <path d="M -40 1060 L 760 640 L 1000 640 L 700 1000 L -40 1000 Z" fill="#000" opacity="0.6" />
        <path d="M -40 -60 L 760 330 L 760 640 L -40 1060 Z" fill="#10171a" />
        <g stroke="#1b2428" strokeWidth="5">
          {NERVURAS_PAREDE.map((n, i) => (
            <line key={i} x1={n.x} y1={n.topo} x2={n.x} y2={n.base} />
          ))}
        </g>
        <path d="M 760 330 L 760 640" stroke="#2a363b" strokeWidth="6" />
      </g>
      {/* coração disparado: o calor do corredor aparece nas bordas */}
      {calor ? <rect width={L} height={A} fill="url(#cen-calor)" className="cen-pulso" /> : null}
    </g>
  )
}

/** Correndo para o portão sul, que vai fechando. Do outro lado, a mata de novo. */
function PortaoSul() {
  return (
    <g>
      <Ceu lua={false} />
      <g transform="translate(-160 0)">
        <path d={copas(23, 470, 40, 80)} fill="#040a07" />
        <rect x="0" y="590" width={L + 160} height="410" fill="url(#cen-patio)" />
        <g className="cen-rastros" fill="none" stroke="#4c3d27" strokeLinecap="round">
          {[-400, 300, 1200, 1900].map((x) => (
            <path key={x} d={`M 760 600 L ${x} ${A}`} strokeWidth="8" strokeDasharray="18 90" />
          ))}
        </g>
        <g className="cen-aproxima cen-aproxima--portao" style={{ transformOrigin: '760px 600px' }}>
          <Cerca topo={430} base={600} de={-240} ate={600} />
          <Cerca topo={430} base={600} de={920} ate={L + 240} />
          <g className="cen-portao">
            <rect x="920" y="440" width="320" height="160" fill="url(#cen-tela)" opacity="0.8" />
            <rect x="920" y="440" width="320" height="160" fill="none" stroke="#1a201d" strokeWidth="8" />
            <path d="M 920 440 L 1240 600 M 920 600 L 1240 440" stroke="#1a201d" strokeWidth="5" />
          </g>
          {[600, 920].map((x) => (
            <g key={x}>
              <rect x={x - 10} y="400" width="20" height="200" fill="#0a0d0c" />
              <circle className="cen-giroflex" cx={x} cy="392" r="9" fill="#ffb224" />
              <circle className="cen-giroflex" cx={x} cy="392" r="40" fill="url(#cen-halo-amarelo)" />
            </g>
          ))}
        </g>
      </g>
      <rect width={L} height={A} fill="url(#cen-vinheta-alerta)" className="cen-alerta" />
    </g>
  )
}

// ---- o painel -----------------------------------------------------------------------

export function Cenario({ ambiente, camadas, fim, sinalPerdido = false, textoFim }: CenarioProps) {
  const quadro = AMBIENTES[ambiente]
  const naCaminhonete =
    ambiente === 'estrada' || ambiente === 'parada' || ambiente === 'zumbido' || ambiente === 'holofote'
  const extras = ambiente === 'mata' ? camadas.flatMap((c) => VISTAS_ESCUTA[c] ?? []) : []
  const agora = !fim
    ? quadro.agora
    : textoFim
      ? textoFim
      : sinalPerdido
        ? 'O rádio ficou mudo. Só estática, os passos e a respiração.'
        : 'Transmissão encerrada. Só o pulso e a corrida.'
  // cada ambiente novo entra com um fade; a caminhonete por dentro é um só quadro
  const chave = naCaminhonete ? 'caminhonete' : ambiente

  return (
    <>
      <div className="cenario" data-ambiente={ambiente} data-fim={fim} aria-hidden="true">
        <svg viewBox={`0 0 ${L} ${A}`} preserveAspectRatio="xMidYMid slice">
          <Defs />
          <g key={chave} className="cen-entra">
            <g transform="translate(800 500) scale(1.03) translate(-800 -500)">
              <g className="cen-balanco">
                {naCaminhonete ? (
                  <Interior ambiente={ambiente} />
                ) : ambiente === 'partida' ? (
                  <Partida />
                ) : ambiente === 'termico' ? (
                  <Termico />
                ) : ambiente === 'cerca' ? (
                  <BeiraDoPatio />
                ) : ambiente === 'patio' ? (
                  <Patio />
                ) : ambiente === 'galpao' ? (
                  <SombraDoGalpao calor={camadas.includes('pulso')} />
                ) : ambiente === 'portao' ? (
                  <PortaoSul />
                ) : ambiente === 'fenda' || ambiente === 'leito' ? (
                  <Fenda fogo={ambiente === 'fenda'} />
                ) : ambiente === 'barco' ? (
                  <Barco />
                ) : (
                  <Mata
                    camadas={camadas}
                    fim={fim}
                    malha={ambiente === 'malha'}
                    raizes={ambiente === 'calmaria' || ambiente === 'bunker'}
                    alarme={ambiente === 'bunker'}
                    predador={
                      ambiente === 'predador' || ambiente === 'ravina'
                        ? 'chegando'
                        : ambiente === 'mira'
                          ? 'mira'
                          : undefined
                    }
                    pedras={ambiente === 'ravina'}
                  />
                )}
              </g>
            </g>
          </g>
        </svg>
      </div>
      <div className="cenario__legenda" role="status" aria-live="polite">
        <p className="cenario__lugar">{quadro.lugar}</p>
        <p className="cenario__agora">{agora}</p>
        {extras.length > 0 && !fim ? <p className="cenario__extras">Em volta: {extras.join(' · ')}</p> : null}
      </div>
    </>
  )
}
