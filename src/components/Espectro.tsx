import { useEffect, useRef } from 'react'
import type { EstadoRadio } from '../hooks/useSimulacaoRadio'

const BARRAS = 32
const ALTURA = 40

/** Energia média do espectro em cada estado do rádio. */
const AMPLITUDE: Record<EstadoRadio, number> = {
  desligado: 0,
  buscando: 0.5,
  conectado: 0.2,
  alerta: 0.85,
}

interface EspectroProps {
  estado: EstadoRadio
  reduzMovimento: boolean
}

/** Barra de ruído/espectro: agita mais ao buscar e no alerta, fica calma ao conectar, some ao desligar. */
export function Espectro({ estado, reduzMovimento }: EspectroProps) {
  const barras = useRef<(SVGRectElement | null)[]>([])

  useEffect(() => {
    const amp = AMPLITUDE[estado]
    const alturas = new Array<number>(BARRAS).fill(0)

    const desenhar = (i: number, fracao: number) => {
      const barra = barras.current[i]
      if (!barra) return
      const h = Math.max(1.5, fracao * ALTURA)
      barra.setAttribute('height', h.toFixed(1))
      barra.setAttribute('y', (ALTURA - h).toFixed(1))
    }
    const envelope = (i: number) => 0.55 + 0.45 * Math.sin((Math.PI * (i + 0.5)) / BARRAS)

    if (reduzMovimento) {
      // quadro parado: alturas fixas, só mudam com o estado
      for (let i = 0; i < BARRAS; i++) {
        const pseudo = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1
        desenhar(i, amp === 0 ? 0 : amp * envelope(i) * (0.3 + 0.7 * pseudo))
      }
      return
    }

    let quadro = 0
    let ultimo = 0
    const passo = (agora: number) => {
      quadro = requestAnimationFrame(passo)
      if (agora - ultimo < 45) return
      ultimo = agora
      const pico = ((Math.sin(agora / 650) + 1) / 2) * BARRAS
      for (let i = 0; i < BARRAS; i++) {
        let alvo = 0
        if (amp > 0) {
          alvo = amp * envelope(i) * (0.2 + 0.8 * Math.random())
          if (estado === 'buscando') alvo += 0.45 * Math.exp(-((i - pico) ** 2) / 6)
          if (estado === 'conectado') alvo += 0.08 * Math.sin(agora / 900 + i * 0.5) + 0.08
        }
        alturas[i] = (alturas[i] ?? 0) + (Math.min(1, alvo) - (alturas[i] ?? 0)) * 0.45
        desenhar(i, alturas[i] ?? 0)
      }
    }
    quadro = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(quadro)
  }, [estado, reduzMovimento])

  return (
    <svg
      className="espectro"
      viewBox={`0 0 ${BARRAS * 10} ${ALTURA}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {Array.from({ length: BARRAS }, (_, i) => (
        <rect
          key={i}
          ref={(el) => {
            barras.current[i] = el
          }}
          x={i * 10 + 1}
          y={ALTURA - 1.5}
          width={8}
          height={1.5}
          rx={1.5}
        />
      ))}
    </svg>
  )
}
