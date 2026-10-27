import { useSyncExternalStore } from 'react'

const CONSULTA = '(prefers-reduced-motion: reduce)'

function assinar(aviso: () => void) {
  const lista = window.matchMedia(CONSULTA)
  lista.addEventListener('change', aviso)
  return () => lista.removeEventListener('change', aviso)
}

/** true quando o sistema pede menos animação. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    assinar,
    () => window.matchMedia(CONSULTA).matches,
    () => false,
  )
}
