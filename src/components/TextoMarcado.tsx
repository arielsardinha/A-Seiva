import { Fragment, useMemo } from 'react'
import { parseMarcas } from '../lib/marcas'

/**
 * Texto de um take com as marcas desenhadas (respiro, pausa, ênfase, ação).
 * Respiro e pausa levam um espaço sem quebra antes (colam na palavra anterior e nunca abrem
 * uma linha) e um espaço normal depois (a linha pode quebrar ali).
 */
export function TextoMarcado({ texto }: { texto: string }) {
  const marcas = useMemo(() => parseMarcas(texto), [texto])
  return (
    <p className="texto">
      {marcas.map((marca, i) => {
        switch (marca.tipo) {
          case 'texto':
            return <span key={i}>{marca.texto}</span>
          case 'enfase':
            return <strong key={i}>{marca.texto}</strong>
          case 'acao':
            return (
              <em key={i} className="texto__acao">
                ({marca.texto})
              </em>
            )
          case 'respiro':
            return (
              <Fragment key={i}>
                {' '}
                <span className="sep sep--respiro" aria-hidden="true">
                  /
                </span>{' '}
              </Fragment>
            )
          case 'pausa':
            return (
              <Fragment key={i}>
                {' '}
                <span className="sep sep--pausa" aria-hidden="true">
                  //
                </span>{' '}
              </Fragment>
            )
        }
      })}
    </p>
  )
}
