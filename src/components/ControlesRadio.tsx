import type { Energia } from '../hooks/useSimulacaoRadio'

interface ControlesRadioProps {
  energia: Energia
  podeConectar: boolean
  sons: boolean
  escuta: boolean
  /** Frase sobre o que está tocando em "O que a Dra. Lis ouve". */
  statusEscuta: string
  erroSom: string | null
  onPower: () => void
  onConectar: () => void
  onSons: () => void
  onEscuta: () => void
}

interface InterruptorProps {
  nome: string
  ligado: boolean
  rotuloLigado: string
  rotuloDesligado: string
  onClick: () => void
}

function Interruptor({ nome, ligado, rotuloLigado, rotuloDesligado, onClick }: InterruptorProps) {
  return (
    <button type="button" role="switch" aria-checked={ligado} className="interruptor" onClick={onClick}>
      <span className="interruptor__trilho" aria-hidden="true">
        <span className="interruptor__bola" />
      </span>
      <span className="interruptor__nome">{nome}</span>
      <span className="interruptor__estado">{ligado ? rotuloLigado : rotuloDesligado}</span>
    </button>
  )
}

/** Botões fora do aparelho: ligar, conectar o canal e os interruptores de som (mudos por padrão). */
export function ControlesRadio({
  energia,
  podeConectar,
  sons,
  escuta,
  statusEscuta,
  erroSom,
  onPower,
  onConectar,
  onSons,
  onEscuta,
}: ControlesRadioProps) {
  return (
    <div className="controles">
      <div className="controles__botoes">
        <button type="button" className="botao botao--forte botao--grande" onClick={onPower}>
          {energia === 'off' ? 'Ligar o rádio' : 'Desligar o rádio'}
        </button>
        <button
          type="button"
          className="botao botao--grande"
          onClick={onConectar}
          disabled={!podeConectar}
          title={podeConectar ? 'Conecta o canal e vai para o T03' : 'Disponível enquanto o rádio estiver buscando'}
        >
          Conectar canal
        </button>
      </div>

      <div className="som">
        <Interruptor nome="Sons do rádio" ligado={sons} rotuloLigado="LIGADO" rotuloDesligado="MUDO" onClick={onSons} />
        <Interruptor
          nome="O que a Dra. Lis ouve"
          ligado={escuta}
          rotuloLigado="LIGADO"
          rotuloDesligado="DESLIGADO"
          onClick={onEscuta}
        />
        <p className="som__status" role="status" aria-live="polite">
          {statusEscuta}
        </p>
        <p className="som__aviso">Use fones: o som do app pode vazar para o microfone e sujar a gravação.</p>
        {erroSom ? (
          <p className="som__erro" role="alert">
            {erroSom}
          </p>
        ) : null}
      </div>
    </div>
  )
}
