import type { Energia } from '../hooks/useSimulacaoRadio'

interface ControlesRadioProps {
  energia: Energia
  podeConectar: boolean
  sons: boolean
  erroSom: string | null
  onPower: () => void
  onConectar: () => void
  onSons: () => void
}

/** Botões fora do aparelho: ligar, conectar o canal e o interruptor de som (mudo por padrão). */
export function ControlesRadio({ energia, podeConectar, sons, erroSom, onPower, onConectar, onSons }: ControlesRadioProps) {
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
        <button type="button" role="switch" aria-checked={sons} className="interruptor" onClick={onSons}>
          <span className="interruptor__trilho" aria-hidden="true">
            <span className="interruptor__bola" />
          </span>
          <span className="interruptor__nome">Sons do rádio</span>
          <span className="interruptor__estado">{sons ? 'LIGADO' : 'MUDO'}</span>
        </button>
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
