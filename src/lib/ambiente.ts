import type { Ambiente, Take } from '../data/cena01'

/**
 * Onde o corredor está no take `indice` (índice entre os takes de fala).
 * Cada take pode mudar o ambiente com `ambiente`; sem ele, vale o do take anterior.
 */
export function ambienteDoTake(falas: readonly Take[], indice: number): Ambiente {
  let ambiente: Ambiente = 'mata'
  for (let i = 0; i <= indice; i++) {
    const definido = falas[i]?.ambiente
    if (definido) ambiente = definido
  }
  return ambiente
}
