import type { CamadaEscuta, Take } from '../data/cena01'

/**
 * O que está em volta do corredor no take `indice` (índice entre os takes de fala).
 * Cada take pode redefinir a lista com `escuta`; sem `escuta`, vale a do take anterior.
 */
export function camadasDoTake(falas: readonly Take[], indice: number): CamadaEscuta[] {
  let camadas: CamadaEscuta[] = []
  for (let i = 0; i <= indice; i++) {
    const definida = falas[i]?.escuta
    if (definida) camadas = definida
  }
  return camadas
}
