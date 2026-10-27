import type { Take } from '../data/cena01'

export const VOLUME_MAXIMO = 7

/** Régua de volume de 1 a 10. O trecho acima do 7 é a zona proibida. */
export function VolumeAlvo({ volume }: { volume: Take['volume'] }) {
  const [de, ate] = typeof volume === 'number' ? [volume, volume] : volume
  const piso = Math.min(de, ate)
  const teto = Math.max(de, ate)
  const rotulo = de === ate ? `${de}` : `${de} → ${ate}`
  const descricao = de === ate ? `Volume alvo ${de} de 10` : `Volume alvo de ${de} para ${ate}, de 10`

  return (
    <span className="volume" role="img" aria-label={descricao}>
      <span className="volume__rotulo">VOL</span>
      <span className="volume__regua" aria-hidden="true">
        {Array.from({ length: 10 }, (_, i) => {
          const n = i + 1
          const modo = n <= piso ? 'cheio' : n <= teto ? 'variavel' : 'vazio'
          return <span key={n} className="volume__passo" data-modo={modo} data-proibido={n > VOLUME_MAXIMO} />
        })}
      </span>
      <span className="volume__valor" aria-hidden="true">
        {rotulo}
      </span>
    </span>
  )
}
