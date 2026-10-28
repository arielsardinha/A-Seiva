import { useEffect, useRef, useState } from 'react'

export type EstadoRadio = 'buscando' | 'conectado' | 'alerta'

export const SINAL_MAX = 6
const arredondar = (n: number) => Math.round(n * 10) / 10
const entre = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

/** Frequência mostrada no visor: varre a faixa enquanto busca e assenta na frequência do canal ao conectar. */
export function useFrequencia(estado: EstadoRadio, reduzMovimento: boolean, alvo: number): number {
  const [freq, setFreq] = useState(alvo)
  const atual = useRef(alvo)
  const fase = useRef(0)

  useEffect(() => {
    const passoMs = reduzMovimento ? 700 : 90
    const aplicar = (f: number) => {
      atual.current = f
      setFreq(f)
    }

    if (estado === 'buscando') {
      const id = window.setInterval(() => {
        fase.current += passoMs / 1000
        const t = fase.current
        aplicar(arredondar(alvo + 4.2 * Math.sin(t * 0.8) + 1.3 * Math.sin(t * 2.1 + 1)))
      }, passoMs)
      return () => window.clearInterval(id)
    }

    // conectado/alerta: assenta na frequência do canal
    const id = window.setInterval(() => {
      const falta = alvo - atual.current
      // a frequência anda de 0,1 em 0,1: perto o bastante, assenta de uma vez
      if (Math.abs(falta) < 0.15) {
        aplicar(alvo)
        window.clearInterval(id)
      } else {
        aplicar(arredondar(atual.current + falta * 0.3))
      }
    }, 70)
    return () => window.clearInterval(id)
  }, [estado, reduzMovimento, alvo])

  return freq
}

/** Nível do medidor de sinal (0 a SINAL_MAX): baixo e oscilando ao buscar, sobe degrau a degrau ao conectar. */
export function useSinal(estado: EstadoRadio, reduzMovimento: boolean): number {
  const [nivel, setNivel] = useState(0)
  const atual = useRef(0)

  useEffect(() => {
    const aplicar = (n: number) => {
      atual.current = n
      setNivel(n)
    }

    const passoMs = reduzMovimento ? 800 : 170
    const id = window.setInterval(() => {
      const n = atual.current
      const sorteio = Math.random()
      if (estado === 'buscando') {
        if (n > 2) aplicar(n - 1)
        else if (sorteio < 0.4) aplicar(entre(n + (Math.random() < 0.5 ? -1 : 1), 0, 2))
      } else if (estado === 'conectado') {
        if (n < SINAL_MAX - 1) aplicar(n + 1)
        else if (sorteio < 0.1) aplicar(n === SINAL_MAX ? SINAL_MAX - 1 : SINAL_MAX)
      } else if (estado === 'alerta') {
        if (n > 5) aplicar(5)
        else if (n < 3) aplicar(n + 1)
        else if (sorteio < 0.5) aplicar(entre(n + (Math.random() < 0.5 ? -1 : 1), 3, 5))
      }
    }, passoMs)
    return () => window.clearInterval(id)
  }, [estado, reduzMovimento])

  return nivel
}
