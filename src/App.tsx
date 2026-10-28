import { useEffect, useMemo, useRef, useState } from 'react'
import { Cenario } from './components/Cenario'
import { Radio } from './components/Radio'
import { ESCALA_MAX, ESCALA_MIN, Teleprompter } from './components/Teleprompter'
import { CENAS, frequenciaDaCena } from './data/cenas'
import { lerSalvo, usePersistido } from './hooks/usePersistido'
import type { EstadoRadio } from './hooks/useSimulacaoRadio'
import { ambienteDoTake } from './lib/ambiente'
import { camadasDoTake } from './lib/escuta'

const TEMPO_AVISO_MS = 4500

export function App() {
  const [cenaId, setCenaId] = usePersistido('cena', CENAS[0].id)
  const cena = CENAS.find((c) => c.id === cenaId) ?? CENAS[0]
  const falas = useMemo(() => cena.takes.filter((t) => t.tipo === 'fala'), [cena])
  // cada cena lembra o próprio take atual e os gravados ('atual' e 'gravados' são de antes, só da cena 1)
  const [atualPorCena, setAtualPorCena] = usePersistido<Record<string, string>>('atual-por-cena', {
    cena01: lerSalvo('atual', ''),
  })
  const [gravadosPorCena, setGravadosPorCena] = usePersistido<Record<string, string[]>>('gravados-por-cena', {
    cena01: lerSalvo<string[]>('gravados', []),
  })
  const atualId = falas.find((t) => t.id === atualPorCena[cena.id])?.id ?? falas[0]?.id ?? ''
  const gravados = gravadosPorCena[cena.id] ?? []
  const [escala, setEscala] = usePersistido('escala', 1)
  const [rolarSozinho, setRolarSozinho] = usePersistido('rolar-sozinho', true)

  const [aviso, setAviso] = useState(false)
  const [txEncerrado, setTxEncerrado] = useState(false)

  const timerAviso = useRef<number | undefined>(undefined)

  const indice = Math.max(0, falas.findIndex((t) => t.id === atualId))
  const take = falas[indice]
  const indiceRadar = falas.findIndex((t) => t.id === cena.takeInicioRadar)
  const indiceFimRadar = cena.takeFimRadar ? falas.findIndex((t) => t.id === cena.takeFimRadar) : -1
  const radar = indiceRadar >= 0 && indice >= indiceRadar && (indiceFimRadar < 0 || indice < indiceFimRadar)
  const noUltimo = indice === falas.length - 1
  // a cena termina com o sinal caindo (estática) em vez de encerrar
  const sinalPerdido = cena.fim === 'caiu'

  // O rádio fica sempre ligado; o estado dele vem do take na tela.
  const estado: EstadoRadio = take?.radio === 'buscando' ? 'buscando' : take?.radio === 'alerta' ? 'alerta' : 'conectado'

  // A imagem do painel mostra onde o corredor está.
  const ambiente = ambienteDoTake(falas, indice)
  const emVolta = useMemo(() => camadasDoTake(falas, indice), [falas, indice])

  useEffect(() => () => window.clearTimeout(timerAviso.current), [])

  // ---- rádio -------------------------------------------------------------------
  const anunciarConexao = () => {
    setAviso(true)
    window.clearTimeout(timerAviso.current)
    timerAviso.current = window.setTimeout(() => setAviso(false), TEMPO_AVISO_MS)
  }

  // ---- navegação ---------------------------------------------------------------
  const lembrarAtual = (id: string) => setAtualPorCena((mapa) => ({ ...mapa, [cena.id]: id }))

  const irPara = (id: string) => {
    const destino = falas.find((t) => t.id === id)
    if (!destino || !take || destino.id === take.id) return
    lembrarAtual(destino.id)
    setTxEncerrado(false)
    if (take.radio === 'buscando' && destino.radio !== 'buscando') anunciarConexao()
    else if (destino.radio === 'buscando') {
      window.clearTimeout(timerAviso.current)
      setAviso(false)
    }
  }

  const proximo = () => {
    const seguinte = falas[indice + 1]
    if (seguinte) irPara(seguinte.id)
    else setTxEncerrado(true)
  }

  const anterior = () => {
    const antes = falas[indice - 1]
    if (antes) irPara(antes.id)
  }

  const trocarCena = (id: string) => {
    if (id === cena.id) return
    setCenaId(id)
    setTxEncerrado(false)
    window.clearTimeout(timerAviso.current)
    setAviso(false)
  }

  // ---- teleprompter ------------------------------------------------------------
  const marcarGravado = (id: string) =>
    setGravadosPorCena((mapa) => {
      const lista = mapa[cena.id] ?? []
      return { ...mapa, [cena.id]: lista.includes(id) ? lista.filter((g) => g !== id) : [...lista, id] }
    })

  const mudarEscala = (delta: number) =>
    setEscala((e) => Math.round(Math.min(ESCALA_MAX, Math.max(ESCALA_MIN, e + delta)) * 10) / 10)

  const zerar = () => {
    setGravadosPorCena((mapa) => ({ ...mapa, [cena.id]: [] }))
    setTxEncerrado(false)
    const inicio = falas[0]
    if (inicio) lembrarAtual(inicio.id)
  }

  // ---- teclado (Espaço e → avançam; ← volta) ----------------------------------
  const acoes = useRef({ proximo, anterior, marcarGravado, mudarEscala, atualId })
  acoes.current = { proximo, anterior, marcarGravado, mudarEscala, atualId }

  useEffect(() => {
    // com o tutorial aberto (janela modal) ou escrevendo num campo, as teclas ficam com ele
    const digitando = (alvo: EventTarget | null) =>
      Boolean(document.querySelector('dialog[open]')) ||
      (alvo instanceof HTMLElement && Boolean(alvo.closest('input, textarea, select, [contenteditable="true"]')))

    const aoApertar = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || digitando(e.target)) return
      const a = acoes.current
      switch (e.key) {
        case ' ':
        case 'ArrowRight':
          e.preventDefault()
          if (!e.repeat) a.proximo()
          break
        case 'ArrowLeft':
          e.preventDefault()
          if (!e.repeat) a.anterior()
          break
        case 'g':
        case 'G':
          if (!e.repeat) a.marcarGravado(a.atualId)
          break
        case '+':
        case '=':
          a.mudarEscala(0.1)
          break
        case '-':
        case '_':
          a.mudarEscala(-0.1)
          break
      }
    }
    // Espaço também ativa botões ao soltar a tecla; aqui ele é sempre "próximo".
    const aoSoltar = (e: KeyboardEvent) => {
      if (e.key === ' ' && !e.ctrlKey && !e.metaKey && !e.altKey && !digitando(e.target)) e.preventDefault()
    }
    window.addEventListener('keydown', aoApertar)
    window.addEventListener('keyup', aoSoltar)
    return () => {
      window.removeEventListener('keydown', aoApertar)
      window.removeEventListener('keyup', aoSoltar)
    }
  }, [])

  return (
    <main className="app">
      <section className="painel-radio" aria-label="Rádio da Dra. Lis">
        <Cenario
          ambiente={ambiente}
          camadas={emVolta}
          fim={txEncerrado}
          sinalPerdido={sinalPerdido}
          textoFim={cena.textoFim}
        />
        <Radio
          estado={estado}
          aviso={aviso}
          txEncerrado={txEncerrado}
          sinalPerdido={sinalPerdido}
          frequencia={frequenciaDaCena(cena)}
          radar={radar}
        />
      </section>

      <Teleprompter
        cenas={CENAS}
        cenaId={cena.id}
        titulo={cena.titulo}
        takes={cena.takes}
        atualId={take?.id ?? ''}
        gravados={gravados}
        escala={escala}
        rolarSozinho={rolarSozinho}
        noUltimo={noUltimo}
        onAnterior={anterior}
        onProximo={proximo}
        onIr={irPara}
        onGravado={marcarGravado}
        onEscala={mudarEscala}
        onRolarSozinho={() => setRolarSozinho((v) => !v)}
        onZerar={zerar}
        onCena={trocarCena}
      />
    </main>
  )
}
