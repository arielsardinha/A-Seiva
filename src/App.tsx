import { useEffect, useMemo, useRef, useState } from 'react'
import { Cenario } from './components/Cenario'
import { ControlesRadio } from './components/ControlesRadio'
import { Radio } from './components/Radio'
import { ESCALA_MAX, ESCALA_MIN, Teleprompter } from './components/Teleprompter'
import { radioAudio, type EstadoSom } from './audio/radioAudio'
import { NOMES_ESCUTA, type CamadaEscuta } from './data/cena01'
import { CENAS, frequenciaDaCena } from './data/cenas'
import { lerSalvo, usePersistido } from './hooks/usePersistido'
import type { Energia, EstadoRadio } from './hooks/useSimulacaoRadio'
import { ambienteDoTake } from './lib/ambiente'
import { camadasDoTake } from './lib/escuta'

const TEMPO_INICIANDO_MS = 1800
const TEMPO_AVISO_MS = 4500

function descreverEscuta(ligada: boolean, energia: Energia, conectado: boolean, camadas: CamadaEscuta[]): string {
  if (!ligada) return 'Ligue para ouvir o que ela ouve pelo rádio depois que o canal conectar.'
  if (energia === 'off') return 'Ligue o rádio para ouvir.'
  if (!conectado) return 'Vai tocar assim que o canal conectar.'
  if (camadas.length === 0) return 'Canal limpo: nada para ouvir neste take.'
  return `Ouvindo agora: ${camadas.map((c) => NOMES_ESCUTA[c]).join(', ')}.`
}

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
  const [altoContraste, setAltoContraste] = usePersistido('alto-contraste', false)

  const [energia, setEnergia] = useState<Energia>('off')
  const [aviso, setAviso] = useState(false)
  const [txEncerrado, setTxEncerrado] = useState(false)
  const [sons, setSons] = useState(false)
  const [escuta, setEscuta] = useState(false)
  const [erroSom, setErroSom] = useState<string | null>(null)
  const [telaCheia, setTelaCheia] = useState(false)

  const timerIniciando = useRef<number | undefined>(undefined)
  const timerAviso = useRef<number | undefined>(undefined)

  const indice = Math.max(0, falas.findIndex((t) => t.id === atualId))
  const take = falas[indice]
  const indiceRadar = falas.findIndex((t) => t.id === cena.takeInicioRadar)
  const indiceFimRadar = cena.takeFimRadar ? falas.findIndex((t) => t.id === cena.takeFimRadar) : -1
  const radar = indiceRadar >= 0 && indice >= indiceRadar && (indiceFimRadar < 0 || indice < indiceFimRadar)
  const noUltimo = indice === falas.length - 1
  // a cena termina com o sinal caindo (estática) em vez de encerrar
  const sinalPerdido = cena.fim === 'caiu'

  // O estado do rádio vem do take na tela; "iniciando" é uma fase de buscar sem varrer.
  const estado: EstadoRadio =
    energia === 'off' ? 'desligado' : energia === 'boot' || take?.radio === 'buscando' ? 'buscando' : take?.radio === 'alerta' ? 'alerta' : 'conectado'

  // ---- áudio acompanha o estado -------------------------------------------------
  useEffect(() => {
    const som: EstadoSom =
      energia === 'off' ? 'desligado' : energia === 'boot' ? 'iniciando' : txEncerrado && sinalPerdido ? 'perdido' : estado
    radioAudio.setEstado(som)
  }, [energia, estado, txEncerrado, sinalPerdido])

  // O que a Dra. Lis ouve só existe depois de sincronizar: rádio ligado e canal conectado.
  const conectado = energia === 'on' && estado !== 'buscando'
  const camadas = useMemo(() => camadasDoTake(falas, indice, txEncerrado), [falas, indice, txEncerrado])
  useEffect(() => {
    radioAudio.setCamadas(conectado ? camadas : [])
  }, [conectado, camadas])

  // A imagem do painel mostra onde o corredor está, com ou sem o rádio ligado.
  const ambiente = ambienteDoTake(falas, indice)
  const emVolta = useMemo(() => camadasDoTake(falas, indice, false), [falas, indice])

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
  const lembrarAtual = (id: string) => setAtualPorCena((mapa) => ({ ...mapa, [cena.id]: id }))

  const irPara = (id: string) => {
    const destino = falas.find((t) => t.id === id)
    if (!destino || !take || destino.id === take.id) return
    lembrarAtual(destino.id)
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
      if (energia === 'on') {
        if (sinalPerdido) radioAudio.cair()
        else radioAudio.encerrar()
      }
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

  const alternarTelaCheia = () => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void document.documentElement.requestFullscreen?.().catch(() => undefined)
  }

  const zerar = () => {
    setGravadosPorCena((mapa) => ({ ...mapa, [cena.id]: [] }))
    setTxEncerrado(false)
    const inicio = falas[0]
    if (inicio) lembrarAtual(inicio.id)
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

  const alternarEscuta = async () => {
    setErroSom(null)
    if (escuta) {
      radioAudio.desativarEscuta()
      setEscuta(false)
      return
    }
    if (await radioAudio.ativarEscuta()) setEscuta(true)
    else setErroSom('Este navegador não liberou o áudio. Tente de novo ou use outro navegador.')
  }

  // ---- teclado (Espaço e → avançam; ← volta) ----------------------------------
  const acoes = useRef({ proximo, anterior, marcarGravado, alternarTelaCheia, alternarEscuta, mudarEscala, atualId })
  acoes.current = { proximo, anterior, marcarGravado, alternarTelaCheia, alternarEscuta, mudarEscala, atualId }

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
        case 'f':
        case 'F':
          if (!e.repeat) a.alternarTelaCheia()
          break
        case 'e':
        case 'E':
          if (!e.repeat) void a.alternarEscuta()
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
          energia={energia}
          estado={estado}
          aviso={aviso}
          txEncerrado={txEncerrado}
          sinalPerdido={sinalPerdido}
          frequencia={frequenciaDaCena(cena)}
          radar={radar}
          onPower={alternarEnergia}
        />
        <ControlesRadio
          energia={energia}
          podeConectar={podeConectar}
          sons={sons}
          escuta={escuta}
          statusEscuta={descreverEscuta(escuta, energia, conectado, camadas)}
          erroSom={erroSom}
          onPower={alternarEnergia}
          onConectar={conectarCanal}
          onSons={alternarSons}
          onEscuta={alternarEscuta}
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
        onCena={trocarCena}
      />
    </main>
  )
}
