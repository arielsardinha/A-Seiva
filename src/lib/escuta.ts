import type { CamadaEscuta, Take } from '../data/cena01'

/**
 * Camadas que a Dra. Lis ouve no take `indice` (índice entre os takes de fala).
 * Cada take pode redefinir a lista com `escuta`; sem `escuta`, vale a do take anterior.
 * Com a transmissão encerrada, vale `escutaFim` do take atual.
 */
export function camadasDoTake(falas: readonly Take[], indice: number, txEncerrado: boolean): CamadaEscuta[] {
  if (txEncerrado) return falas[indice]?.escutaFim ?? []
  let camadas: CamadaEscuta[] = []
  for (let i = 0; i <= indice; i++) {
    const definida = falas[i]?.escuta
    if (definida) camadas = definida
  }
  return camadas
}
