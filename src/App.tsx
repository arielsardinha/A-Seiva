import { useEffect, useMemo, useRef, useState } from 'react'
import { ControlesRadio } from './components/ControlesRadio'
import { Radio } from './components/Radio'
import { ESCALA_MAX, ESCALA_MIN, Teleprompter } from './components/Teleprompter'
import { radioAudio, type EstadoSom } from './audio/radioAudio'
import { TAKE_INICIO_RADAR, cena01 } from './data/cena01'
import { gravarSalvo, lerSalvo, usePersistido } from './hooks/usePersistido'
import type { Energia, EstadoRadio } from './hooks/useSimulacaoRadio'

const TEMPO_INICIANDO_MS = 1800
const TEMPO_AVISO_MS = 4500

export function App() {
  const falas = useMemo(() => cena01.filter((t) => t.tipo === 'fala'), [])
  const [atualId, setAtualId] = useState(() => {
    const salvo = lerSalvo<string | null>('atual', null)
    return falas.find((t) => t.id === salvo)?.id ?? falas[0]?.id ?? ''
  })
  const [gravados, setGravados] = usePersistido<string[]>('gravados', [])
  const [escala, setEscala] = usePersistido('escala', 1)
  const [rolarSozinho, setRolarSozinho] = usePersistido('rolar-sozinho', true)
  const [altoContraste, setAltoContraste] = usePersistido('alto-contraste', false)

  const [energia, setEnergia] = useState<Energia>('off')
  const [aviso, setAviso] = useState(false)
  const [txEncerrado, setTxEncerrado] = useState(false)
  const [sons, setSons] = useState(false)
  const [erroSom, setErroSom] = useState<string | null>(null)
  const [telaCheia, setTelaCheia] = useState(false)

  const timerIniciando = useRef<number | undefined>(undefined)
  const timerAviso = useRef<number | undefined>(undefined)

  const indice = Math.max(0, falas.findIndex((t) => t.id === atualId))
  const take = falas[indice]
  const indiceRadar = falas.findIndex((t) => t.id === TAKE_INICIO_RADAR)
  const radar = indiceRadar >= 0 && indice >= indiceRadar
  const noUltimo = indice === falas.length - 1

  // O estado do rádio vem do take na tela; "iniciando" é uma fase de buscar sem varrer.
  const estado: EstadoRadio =
    energia === 'off' ? 'desligado' : energia === 'boot' || take?.radio === 'buscando' ? 'buscando' : take?.radio === 'alerta' ? 'alerta' : 'conectado'

  // ---- áudio acompanha o estado -------------------------------------------------
  useEffect(() => {
    const som: EstadoSom = energia === 'off' ? 'desligado' : energia === 'boot' ? 'conectado' : estado
    radioAudio.setEstado(som)
  }, [energia, estado])

  useEffect(() => {
    document.documentElement.dataset.contraste = altoContraste ? 'alto' : 'normal'
  }, [altoContraste])

  useEffect(() => {
    const mudou = () => setTelaCheia(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', mudou)
    return () => document.removeEventListener('fullscreenchange', mudou)
  }, [])

  useEffect(
    () => () => {
      window.clearTimeout(timerIniciando.current)
      window.clearTimeout(timerAviso.current)
    },
    [],
  )

  // ---- rádio -------------------------------------------------------------------
  const alternarEnergia = () => {
    window.clearTimeout(timerIniciando.current)
    window.clearTimeout(timerAviso.current)
    setAviso(false)
    setTxEncerrado(false)
    if (energia === 'off') {
      radioAudio.clique(true)
      setEnergia('boot')
      timerIniciando.current = window.setTimeout(() => setEnergia('on'), TEMPO_INICIANDO_MS)
    } else {
      radioAudio.clique(false)
      setEnergia('off')
    }
  }

  const anunciarConexao = () => {
    radioAudio.confirmar()
    setAviso(true)
    window.clearTimeout(timerAviso.current)
    timerAviso.current = window.setTimeout(() => setAviso(false), TEMPO_AVISO_MS)
  }

  // ---- navegação ---------------------------------------------------------------
  const irPara = (id: string) => {
    const destino = falas.find((t) => t.id === id)
    if (!destino || !take || destino.id === take.id) return
    setAtualId(destino.id)
    gravarSalvo('atual', destino.id)
    setTxEncerrado(false)
    if (energia === 'on') {
      if (take.radio === 'buscando' && destino.radio !== 'buscando') anunciarConexao()
      else if (destino.radio === 'buscando') {
        window.clearTimeout(timerAviso.current)
        setAviso(false)
      }
    }
  }

  const proximo = () => {
    const seguinte = falas[indice + 1]
    if (seguinte) irPara(seguinte.id)
    else if (!txEncerrado) {
      setTxEncerrado(true)
      if (energia === 'on') radioAudio.encerrar()
    }
  }

  const anterior = () => {
    const antes = falas[indice - 1]
    if (antes) irPara(antes.id)
  }

  const podeConectar = energia === 'on' && take?.radio === 'buscando'
  const conectarCanal = () => {
    const destino = falas.find((t) => t.radio !== 'buscando')
    if (podeConectar && destino) irPara(destino.id)
  }

  // ---- teleprompter ------------------------------------------------------------
  const marcarGravado = (id: string) =>
    setGravados((lista) => (lista.includes(id) ? lista.filter((g) => g !== id) : [...lista, id]))

  const mudarEscala = (delta: number) =>
    setEscala((e) => Math.round(Math.min(ESCALA_MAX, Math.max(ESCALA_MIN, e + delta)) * 10) / 10)

  const alternarTelaCheia = () => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void document.documentElement.requestFullscreen?.().catch(() => undefined)
  }

  const zerar = () => {
    setGravados([])
    setTxEncerrado(false)
    const inicio = falas[0]
    if (inicio) {
      setAtualId(inicio.id)
      gravarSalvo('atual', inicio.id)
    }
  }

  // ---- som ---------------------------------------------------------------------
  const alternarSons = async () => {
    setErroSom(null)
    if (sons) {
      radioAudio.desativar()
      setSons(false)
      return
    }
    if (await radioAudio.ativar()) setSons(true)
    else setErroSom('Este navegador não liberou o áudio. Tente de novo ou use outro navegador.')
  }

  // ---- teclado (Espaço e → avançam; ← volta) ----------------------------------
  const acoes = useRef({ proximo, anterior, marcarGravado, alternarTelaCheia, mudarEscala, atualId })
  acoes.current = { proximo, anterior, marcarGravado, alternarTelaCheia, mudarEscala, atualId }

  useEffect(() => {
    const digitando = (alvo: EventTarget | null) =>
      alvo instanceof HTMLElement && Boolean(alvo.closest('input, textarea, select, [contenteditable="true"]'))

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
        case 'f':
        case 'F':
          if (!e.repeat) a.alternarTelaCheia()
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
        <Radio energia={energia} estado={estado} aviso={aviso} txEncerrado={txEncerrado} radar={radar} onPower={alternarEnergia} />
        <ControlesRadio
          energia={energia}
          podeConectar={podeConectar}
          sons={sons}
          erroSom={erroSom}
          onPower={alternarEnergia}
          onConectar={conectarCanal}
          onSons={alternarSons}
        />
      </section>

      <Teleprompter
        takes={cena01}
        atualId={take?.id ?? ''}
        gravados={gravados}
        escala={escala}
        rolarSozinho={rolarSozinho}
        altoContraste={altoContraste}
        telaCheia={telaCheia}
        noUltimo={noUltimo}
        onAnterior={anterior}
        onProximo={proximo}
        onIr={irPara}
        onGravado={marcarGravado}
        onEscala={mudarEscala}
        onRolarSozinho={() => setRolarSozinho((v) => !v)}
        onAltoContraste={() => setAltoContraste((v) => !v)}
        onTelaCheia={alternarTelaCheia}
        onZerar={zerar}
      />
    </main>
  )
}
