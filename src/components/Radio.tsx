import { useReducedMotion } from '../hooks/useReducedMotion'
import { SINAL_MAX, useFrequencia, useSinal, type EstadoRadio } from '../hooks/useSimulacaoRadio'
import { Espectro } from './Espectro'
import { Radar } from './Radar'

/** O rádio fica sempre ligado: é só a referência do sinal e de quem está no canal. */
interface RadioProps {
  estado: EstadoRadio
  /** Mostra "CANAL SEGURO ESTABELECIDO" (os primeiros segundos depois de conectar). */
  aviso: boolean
  /** O take final terminou: "TX ENCERRADO". */
  txEncerrado: boolean
  /** A transmissão caiu em vez de encerrar: "SINAL PERDIDO", sem sinal e só estática. */
  sinalPerdido: boolean
  /** Frequência em que o rádio se fixa nesta cena (MHz). */
  frequencia: number
  /** Mini-radar do visor (a partir do T11). */
  radar: boolean
}

interface TextoVisor {
  linha: string
  etiqueta: string
}

function textoDoVisor({ estado, aviso, txEncerrado, sinalPerdido }: RadioProps): TextoVisor {
  if (txEncerrado && sinalPerdido) return { linha: 'SINAL PERDIDO', etiqueta: 'MUDO' }
  if (txEncerrado) return { linha: 'TX ENCERRADO', etiqueta: 'FIM' }
  switch (estado) {
    case 'buscando':
      return { linha: 'BUSCANDO CANAL…', etiqueta: 'BUSCA' }
    case 'alerta':
      return { linha: 'ALERTA · SINAL INSTÁVEL', etiqueta: 'ALERTA' }
    default:
      return { linha: aviso ? 'CANAL SEGURO ESTABELECIDO' : 'CANAL SEGURO', etiqueta: 'SEGURO' }
  }
}

type ModoLed = 'apagado' | 'aceso' | 'pisca' | 'tremula'

function Led({ nome, cor, modo }: { nome: string; cor: 'verde' | 'vermelho' | 'ambar'; modo: ModoLed }) {
  return (
    <span className="led">
      <span className={`led__luz led__luz--${cor}`} data-modo={modo} />
      <span className="led__nome">{nome}</span>
    </span>
  )
}

function MedidorSinal({ nivel }: { nivel: number }) {
  return (
    <div className="sinal" role="img" aria-label={`Sinal ${nivel} de ${SINAL_MAX}`}>
      <div className="sinal__barras">
        {Array.from({ length: SINAL_MAX }, (_, i) => (
          <span key={i} className="sinal__barra" data-aceso={i < nivel} style={{ height: `${28 + i * 13}%` }} />
        ))}
      </div>
      <span className="rotulo">SINAL</span>
    </div>
  )
}

// a faixa do botão cobre o canal da Lis (88.3) e a emergência (104.7)
const FAIXA_MIN = 84
const FAIXA_MAX = 108

function Sintonia({ freq }: { freq: number }) {
  const angulo = Math.min(135, Math.max(-135, ((freq - FAIXA_MIN) / (FAIXA_MAX - FAIXA_MIN)) * 270 - 135))
  return (
    <div className="sintonia">
      <svg viewBox="0 0 100 100" className="sintonia__botao" aria-hidden="true">
        {Array.from({ length: 19 }, (_, i) => {
          const a = ((i / 18) * 270 - 135) * (Math.PI / 180)
          const maior = i % 3 === 0
          const r1 = maior ? 41 : 44
          return (
            <line
              key={i}
              className="sintonia__marca"
              x1={50 + Math.sin(a) * r1}
              y1={50 - Math.cos(a) * r1}
              x2={50 + Math.sin(a) * 48}
              y2={50 - Math.cos(a) * 48}
            />
          )
        })}
        <g className="sintonia__rotor" style={{ transform: `rotate(${angulo}deg)`, transformOrigin: '50px 50px' }}>
          <circle className="sintonia__serrilha" cx="50" cy="50" r="35" />
          <circle className="sintonia__topo" cx="50" cy="50" r="30" />
          <circle className="sintonia__brilho" cx="50" cy="50" r="22" />
          <rect className="sintonia__ponteiro" x="47.5" y="22" width="5" height="17" rx="2.5" />
        </g>
      </svg>
      <span className="rotulo">SINTONIA</span>
    </div>
  )
}

function Antena() {
  return (
    <svg className="radio__antena" viewBox="0 0 40 220" aria-hidden="true">
      <rect className="antena__base" x="9" y="196" width="22" height="24" rx="3" />
      <rect className="antena__trecho" x="15.5" y="132" width="9" height="66" rx="2" />
      <rect className="antena__trecho" x="17.5" y="70" width="5" height="64" rx="1.5" />
      <rect className="antena__trecho" x="19" y="14" width="2" height="58" rx="1" />
      <circle className="antena__ponta" cx="20" cy="11" r="4.5" />
    </svg>
  )
}

const FUROS = Array.from({ length: 4 }, (_, linha) => Array.from({ length: 20 }, (_, coluna) => ({ linha, coluna })))

function AltoFalante() {
  return (
    <svg className="grade" viewBox="0 0 200 40" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      {FUROS.flat().map(({ linha, coluna }) => (
        <circle key={`${linha}-${coluna}`} cx={10 + coluna * 10 + (linha % 2) * 5} cy={6 + linha * 9.4} r="2.4" />
      ))}
    </svg>
  )
}

export function Radio(props: RadioProps) {
  const { estado, txEncerrado, sinalPerdido, frequencia, radar } = props
  const reduzMovimento = useReducedMotion()
  const freq = useFrequencia(estado, reduzMovimento, frequencia)
  const sinal = useSinal(estado, reduzMovimento)
  const visor = textoDoVisor(props)
  // sinal perdido: o canal morre, só fica a estática
  const caiu = txEncerrado && sinalPerdido
  const nivel = caiu ? 0 : sinal

  const modoRx: ModoLed = caiu
    ? 'apagado'
    : estado === 'buscando'
      ? 'tremula'
      : estado === 'alerta'
        ? 'tremula'
        : 'aceso'
  const modoTx: ModoLed = txEncerrado ? 'apagado' : estado === 'buscando' ? 'pisca' : 'aceso'
  const corCanal = estado === 'alerta' ? 'ambar' : 'verde'
  const modoCanal: ModoLed = caiu || estado === 'buscando' ? 'apagado' : estado === 'alerta' ? 'pisca' : 'aceso'

  const textoFreq = caiu ? '---.-' : freq.toFixed(1).padStart(5, '0')

  return (
    <div className="radio-wrap">
      <div className="radio" data-estado={estado} data-fim={txEncerrado} data-caiu={caiu}>
        <Antena />
        <div className="radio__corpo">
          <i className="parafuso parafuso--a" />
          <i className="parafuso parafuso--b" />
          <i className="parafuso parafuso--c" />
          <i className="parafuso parafuso--d" />

          <div className="radio__topo">
            <span className="radio__marca">
              LIS-7<small>COMUNICADOR</small>
            </span>
            <div className="leds">
              <Led nome="RX" cor="verde" modo={modoRx} />
              <Led nome="TX" cor="vermelho" modo={modoTx} />
              <Led nome="CANAL" cor={corCanal} modo={modoCanal} />
            </div>
          </div>

          <div className="visor" aria-hidden="true">
            <div className="visor__tela">
              <div className="visor__topo">
                <span className="visor__freq">FREQ {textoFreq}</span>
                <span className="visor__etiqueta">{visor.etiqueta}</span>
              </div>
              <div className="visor__corpo">
                <p className="visor__mensagem" key={visor.linha}>
                  {visor.linha}
                </p>
                {radar && !txEncerrado ? <Radar /> : null}
              </div>
            </div>
          </div>

          <div className="radio__meio">
            <MedidorSinal nivel={nivel} />
            <Sintonia freq={freq} />
          </div>

          <div className="radio__espectro">
            <Espectro estado={caiu ? 'buscando' : estado} reduzMovimento={reduzMovimento} />
          </div>

          <AltoFalante />
        </div>
      </div>

      <p className="so-leitor" role="status" aria-live="polite">
        {`Rádio: ${visor.linha.replace('…', '').toLowerCase()}`}
      </p>
    </div>
  )
}
