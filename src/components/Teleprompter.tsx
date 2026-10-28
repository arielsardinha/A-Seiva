import { Fragment, useLayoutEffect, useRef, type CSSProperties } from 'react'
import { PERSONAGENS, type Take } from '../data/cena01'
import type { Cena } from '../data/cenas'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { LegendaMarcas } from './LegendaMarcas'
import { TextoMarcado } from './TextoMarcado'
import { Tutorial } from './Tutorial'

export const ESCALA_MIN = 0.8
export const ESCALA_MAX = 1.8

interface TeleprompterProps {
  cenas: readonly Cena[]
  cenaId: string
  titulo: string
  takes: Take[]
  atualId: string
  gravados: readonly string[]
  escala: number
  rolarSozinho: boolean
  /** Está no último take: "Próximo" vira "Encerrar TX". */
  noUltimo: boolean
  onAnterior: () => void
  onProximo: () => void
  onIr: (id: string) => void
  onGravado: (id: string) => void
  onEscala: (delta: number) => void
  onRolarSozinho: () => void
  onZerar: () => void
  onCena: (id: string) => void
}

function Cues({ lista }: { lista?: string[] }) {
  if (!lista?.length) return null
  return (
    <ul className="cues" aria-label="Sons do sound design (não grave)">
      {lista.map((cue) => (
        <li key={cue} className="chip">
          <b>SOM</b> {cue}
        </li>
      ))}
    </ul>
  )
}

export function Teleprompter(props: TeleprompterProps) {
  const { takes, atualId, gravados, escala, rolarSozinho, noUltimo } = props
  const reduzMovimento = useReducedMotion()
  const rolagem = useRef<HTMLDivElement>(null)
  const atualRef = useRef<HTMLElement>(null)
  const primeiraRolagem = useRef(true)

  const falas = takes.filter((t) => t.tipo === 'fala')
  const posicaoAtual = takes.findIndex((t) => t.id === atualId)
  const numeroAtual = falas.findIndex((t) => t.id === atualId) + 1
  const primeiro = numeroAtual <= 1
  const gravadosNaCena = falas.filter((t) => gravados.includes(t.id)).length

  // Centraliza o take atual (sem animação na primeira vez e quando o usuário pede menos movimento)
  useLayoutEffect(() => {
    if (!rolarSozinho) return
    const area = rolagem.current
    const atual = atualRef.current
    if (!area || !atual) return
    const centralizar = (suave: boolean) =>
      area.scrollTo({
        top: atual.offsetTop - (area.clientHeight - atual.offsetHeight) / 2,
        behavior: suave && !reduzMovimento ? 'smooth' : 'auto',
      })
    centralizar(!primeiraRolagem.current)
    primeiraRolagem.current = false

    const observador = new ResizeObserver(() => centralizar(false))
    observador.observe(area)
    return () => observador.disconnect()
  }, [atualId, escala, rolarSozinho, reduzMovimento])

  return (
    <section className="tp" aria-label="Teleprompter" style={{ '--escala': escala } as CSSProperties}>
      <header className="tp__cab">
        <div>
          <div className="tp__linha">
            <h1 className="tp__titulo">{props.titulo}</h1>
            <select
              className="tp__cena"
              aria-label="Escolher a cena"
              value={props.cenaId}
              onChange={(e) => props.onCena(e.target.value)}
            >
              {props.cenas.map((c, i) => (
                <option key={c.id} value={c.id}>
                  Cena {i + 1}
                </option>
              ))}
            </select>
          </div>
          <p className="tp__situacao" aria-live="polite">
            Take {numeroAtual} de {falas.length} · {gravadosNaCena} gravado{gravadosNaCena === 1 ? '' : 's'}
          </p>
        </div>
      </header>

      <div className="tp__progresso" aria-hidden="true">
        <span style={{ width: `${(gravadosNaCena / Math.max(1, falas.length)) * 100}%` }} />
      </div>

      <div className="tp__barra" role="toolbar" aria-label="Controles do teleprompter">
        <div className="grupo">
          <button type="button" className="botao" onClick={props.onAnterior} disabled={primeiro}>
            ‹ Anterior
          </button>
          <button type="button" className="botao botao--forte" onClick={props.onProximo}>
            {noUltimo ? 'Encerrar TX' : 'Próximo ›'}
          </button>
          <button
            type="button"
            className="botao"
            aria-pressed={gravados.includes(atualId)}
            onClick={() => props.onGravado(atualId)}
          >
            ✓ Gravado
          </button>
        </div>
        <div className="grupo">
          <button
            type="button"
            className="botao botao--curto"
            onClick={() => props.onEscala(-0.1)}
            disabled={escala <= ESCALA_MIN + 0.001}
            aria-label="Diminuir o tamanho da letra"
          >
            A−
          </button>
          <button
            type="button"
            className="botao botao--curto"
            onClick={() => props.onEscala(0.1)}
            disabled={escala >= ESCALA_MAX - 0.001}
            aria-label="Aumentar o tamanho da letra"
          >
            A+
          </button>
          <button type="button" className="botao" aria-pressed={rolarSozinho} onClick={props.onRolarSozinho}>
            Rolar sozinho
          </button>
        </div>
        <div className="grupo">
          <LegendaMarcas />
          <Tutorial />
        </div>
      </div>

      <div className="tp__rolagem" ref={rolagem}>
        <div className="tp__lista">
          {takes.map((take, posicao) => {
            const status = posicao < posicaoAtual ? 'feito' : posicao === posicaoAtual ? 'atual' : 'proximo'

            if (take.tipo === 'sistema') {
              return (
                <Fragment key={take.id}>
                  <Cues lista={take.cuesAntes} />
                  <div className="sistema" data-status={status}>
                    <p className="sistema__rotulo">VOZ DO SISTEMA (não grave)</p>
                    <p className="sistema__visor">
                      No visor: <q>{take.texto}</q>
                    </p>
                    <p className="sistema__nota">{take.direcao}</p>
                  </div>
                  <Cues lista={take.cuesDepois} />
                </Fragment>
              )
            }

            const atual = status === 'atual'
            const gravado = gravados.includes(take.id)
            const quem = take.quem ?? 'lis'
            return (
              <Fragment key={take.id}>
                <Cues lista={take.cuesAntes} />
                <article
                  className="take"
                  data-status={status}
                  data-gravado={gravado}
                  aria-current={atual ? 'step' : undefined}
                  aria-label={`Take ${take.id}`}
                  ref={atual ? atualRef : undefined}
                >
                  {atual ? null : (
                    <button
                      type="button"
                      className="take__ir"
                      onClick={() => props.onIr(take.id)}
                      aria-label={`Ir para o take ${take.id}`}
                    />
                  )}
                  <header className="take__cab">
                    <span className="take__id">{take.id}</span>
                    <span className="take__quem" data-quem={quem}>
                      {PERSONAGENS[quem].nome}
                    </span>
                    <span className="take__duracao">~{take.duracaoSeg} s</span>
                    <button
                      type="button"
                      className="take__ok"
                      aria-pressed={gravado}
                      aria-label={`Marcar ${take.id} como gravado`}
                      title="Marcar como gravado"
                      onClick={() => props.onGravado(take.id)}
                    >
                      ✓
                    </button>
                  </header>
                  <p className="take__direcao">{take.direcao}</p>
                  <TextoMarcado texto={take.texto} />
                </article>
                <Cues lista={take.cuesDepois} />
              </Fragment>
            )
          })}
          <div className="tp__rodape">
            <button
              type="button"
              className="botao botao--discreto"
              onClick={() => {
                if (window.confirm('Zerar as marcas de gravado e voltar ao início?')) props.onZerar()
              }}
            >
              Zerar marcas e voltar ao início
            </button>
          </div>
        </div>
      </div>

      <footer className="tp__atalhos" aria-hidden="true">
        <kbd>Espaço</kbd> / <kbd>→</kbd> próximo · <kbd>←</kbd> anterior · <kbd>G</kbd> gravado
      </footer>
    </section>
  )
}
