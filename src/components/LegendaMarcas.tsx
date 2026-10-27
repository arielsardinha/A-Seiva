import { useEffect, useId, useRef, useState } from 'react'

/** Botão "Legenda" que abre um popover explicando as marcas do texto e os atalhos. */
export function LegendaMarcas() {
  const [aberta, setAberta] = useState(false)
  const raiz = useRef<HTMLDivElement>(null)
  const painelId = useId()

  useEffect(() => {
    if (!aberta) return
    const fora = (e: PointerEvent) => {
      if (raiz.current && !raiz.current.contains(e.target as Node)) setAberta(false)
    }
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAberta(false)
    }
    document.addEventListener('pointerdown', fora)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('pointerdown', fora)
      document.removeEventListener('keydown', esc)
    }
  }, [aberta])

  return (
    <div className="legenda" ref={raiz}>
      <button
        type="button"
        className="botao"
        aria-expanded={aberta}
        aria-controls={painelId}
        onClick={() => setAberta((a) => !a)}
      >
        Legenda
      </button>
      {aberta ? (
        <div className="legenda__painel" id={painelId} role="region" aria-label="Legenda das marcas">
          <h2>Marcas do texto</h2>
          <dl>
            <dt>
              <span className="sep sep--respiro" aria-hidden="true">
                /
              </span>
            </dt>
            <dd>respiro curto</dd>
            <dt>
              <span className="sep sep--pausa" aria-hidden="true">
                //
              </span>
            </dt>
            <dd>pausa maior</dd>
            <dt>
              <strong>peso</strong>
            </dt>
            <dd>palavra com mais peso</dd>
            <dt>
              <em className="texto__acao">(ação)</em>
            </dt>
            <dd>ação ou som, não é falada</dd>
          </dl>
          <h2>Atalhos</h2>
          <dl>
            <dt>
              <kbd>Espaço</kbd> <kbd>→</kbd>
            </dt>
            <dd>próximo take</dd>
            <dt>
              <kbd>←</kbd>
            </dt>
            <dd>take anterior</dd>
            <dt>
              <kbd>G</kbd>
            </dt>
            <dd>marcar como gravado</dd>
            <dt>
              <kbd>F</kbd>
            </dt>
            <dd>tela cheia</dd>
            <dt>
              <kbd>E</kbd>
            </dt>
            <dd>o que a Dra. Lis ouve</dd>
            <dt>
              <kbd>+</kbd> <kbd>−</kbd>
            </dt>
            <dd>tamanho da letra</dd>
          </dl>
        </div>
      ) : null}
    </div>
  )
}
