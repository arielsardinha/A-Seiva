import { useId, useRef, type ReactNode } from 'react'
import { TextoMarcado } from './TextoMarcado'

interface LinhaProps {
  amostra: ReactNode
  titulo: string
  children: ReactNode
}

/** Uma linha do tutorial: como o símbolo aparece na tela, ao lado do que ele significa. */
function Linha({ amostra, titulo, children }: LinhaProps) {
  return (
    <li className="tutorial__linha">
      <div className="tutorial__amostra">{amostra}</div>
      <div>
        <h4>{titulo}</h4>
        <p>{children}</p>
      </div>
    </li>
  )
}

const EXEMPLO = 'Ai, meu **Deus**. // Conectou. / Conectou! // *(respira)* Tá. / Calma, Lis. / **Foco.**'

/** Botão "Tutorial" + janela explicando cada símbolo do texto e cada elemento de um take. */
export function Tutorial() {
  const dialogo = useRef<HTMLDialogElement>(null)
  const titulo = useId()
  const fechar = () => dialogo.current?.close()

  return (
    <>
      <button type="button" className="botao" onClick={() => dialogo.current?.showModal()}>
        Tutorial
      </button>
      <dialog
        ref={dialogo}
        className="tutorial"
        aria-labelledby={titulo}
        onClick={(e) => {
          // clique no fundo escurecido (fora do conteúdo) fecha
          if (e.target === e.currentTarget) fechar()
        }}
      >
        <div className="tutorial__corpo">
          <header className="tutorial__cab">
            <h2 id={titulo}>Tutorial: o que significa cada símbolo</h2>
            <button type="button" className="botao" onClick={fechar} autoFocus>
              Fechar
            </button>
          </header>

          <section>
            <h3>Símbolos dentro do texto</h3>
            <p className="tutorial__intro">
              O texto de cada take traz marcas de atuação. Elas não são faladas: dizem <em>como</em> falar.
            </p>
            <ul className="tutorial__lista">
              <Linha amostra={<TextoMarcado texto="Tá, tá, tá… / vai." />} titulo="/ Respiro curto">
                Um fôlego rápido, uma micropausa. Respire ou hesite um instante e siga: a frase continua, não corte o
                raciocínio.
              </Linha>
              <Linha amostra={<TextoMarcado texto="Conecta. // Conecta, por favor." />} titulo="// Pausa maior">
                Pare de verdade antes de seguir. É o silêncio que faz o efeito (peso, dúvida, gancho). Fica mais marcada
                na tela e dura mais que o respiro.
              </Linha>
              <Linha amostra={<TextoMarcado texto="Aqui é a **Lis**!" />} titulo="Palavra em negrito (amarela)">
                Dê mais peso a esta palavra: mais intenção e firmeza. Ênfase não é gritar.
              </Linha>
              <Linha amostra={<TextoMarcado texto="*(respira)* Tá." />} titulo="(texto) em cinza e itálico">
                Ação, não é falada. Não diga a palavra: faça a ação (por exemplo, respirar de verdade) e siga com a
                fala.
              </Linha>
            </ul>
          </section>

          <section>
            <h3>Exemplo, passo a passo</h3>
            <div className="tutorial__exemplo">
              <TextoMarcado texto={EXEMPLO} />
            </div>
            <ol className="tutorial__passos">
              <li>
                Diga “Ai, meu” normal e dê peso em <strong>“Deus”</strong>.
              </li>
              <li>
                <b>//</b> pausa maior. Silêncio de verdade.
              </li>
              <li>
                “Conectou.” <b>/</b> respiro curto, “Conectou!”
              </li>
              <li>
                <b>//</b> outra pausa maior.
              </li>
              <li>
                <i>(respira)</i>: respire de verdade, sem falar. Depois “Tá.”
              </li>
              <li>
                <b>/</b> respiro, “Calma, Lis.” <b>/</b> respiro e, com peso, <strong>“Foco.”</strong>
              </li>
            </ol>
          </section>

          <section>
            <h3>O que aparece em cada take</h3>
            <ul className="tutorial__lista">
              <Linha amostra={<span className="take__id">T04</span>} titulo="Número do take">
                Identifica o take. Os takes se gravam um de cada vez, na ordem.
              </Linha>
              <Linha
                amostra={
                  <span className="take__quem" data-quem="dito">
                    Dito
                  </span>
                }
                titulo="Quem fala"
              >
                O personagem que fala no take.
              </Linha>
              <Linha amostra={<span className="take__duracao">~9 s</span>} titulo="Duração estimada">
                Quanto a fala deve levar, só como referência. Não precisa ser exato.
              </Linha>
              <Linha
                amostra={<p className="take__direcao">colada no microfone, ofegante, olhando por cima do ombro</p>}
                titulo="Linha em itálico: direção de atuação"
              >
                Como dizer a fala (o estado de espírito, a intenção). Não é falada.
              </Linha>
              <Linha
                amostra={
                  <span className="take__ok tutorial__ok" aria-hidden="true">
                    ✓
                  </span>
                }
                titulo="✓ Marcar como gravado"
              >
                Marca o take como já gravado (atalho: <kbd>G</kbd>). Fica salvo no navegador.
              </Linha>
              <Linha
                amostra={
                  <ul className="cues">
                    <li className="chip">
                      <b>SOM</b> drone grave
                    </li>
                  </ul>
                }
                titulo="Chip SOM: som do sound design"
              >
                O que o sound design vai colocar nesse ponto. Não é falado: serve para você saber o que vai acontecer.
              </Linha>
              <Linha
                amostra={
                  <div className="sistema">
                    <p className="sistema__rotulo">VOZ DO SISTEMA (não grave)</p>
                  </div>
                }
                titulo="Voz do sistema"
              >
                Linha que aparece no visor do rádio (“Canal seguro estabelecido”). Pule: <b>não se grava</b>.
              </Linha>
            </ul>
          </section>

          <section>
            <h3>O rádio ao lado do texto</h3>
            <p className="tutorial__intro">
              O rádio não faz som e não tem botão: ele segue o take sozinho e serve de referência para o clima da cena.
            </p>
            <ul className="tutorial__lista">
              <Linha amostra={<span className="tutorial__radio">SINAL</span>} titulo="Barras de sinal">
                Poucas barras oscilando: o sinal está fraco ou caindo. Todas acesas: o canal está firme.
              </Linha>
              <Linha amostra={<span className="tutorial__radio">BUSCANDO CANAL…</span>} titulo="Mensagem do visor">
                <b>Buscando canal</b>: ainda não tem ninguém do outro lado. <b>Canal seguro</b>: alguém está falando com
                o corredor. <b>Alerta</b>: o sinal está instável, perigo por perto. <b>TX encerrado</b> e{' '}
                <b>sinal perdido</b>: a conversa acabou ou caiu.
              </Linha>
              <Linha amostra={<span className="tutorial__radio">RX · TX · CANAL</span>} titulo="Luzes">
                <b>TX</b> piscando: tentando falar. Aceso: a transmissão está no ar. <b>CANAL</b> verde é seguro, âmbar
                é alerta.
              </Linha>
            </ul>
          </section>

          <section>
            <h3>Como o take aparece na lista</h3>
            <p className="tutorial__intro">
              Letra <b>grande, com borda âmbar</b>: o take atual. Letra <b>pequena e esmaecida</b>: os que já passaram.
              Letra <b>pequena</b>: os próximos. Clique em qualquer take para pular para ele.
            </p>
          </section>

          <footer className="tutorial__rodape">
            <button type="button" className="botao botao--forte" onClick={fechar}>
              Entendi
            </button>
          </footer>
        </div>
      </dialog>
    </>
  )
}
