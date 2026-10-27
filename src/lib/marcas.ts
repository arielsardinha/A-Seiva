/** Um pedaço do texto de um take, já interpretado. */
export type Marca =
  | { tipo: 'texto'; texto: string }
  | { tipo: 'enfase'; texto: string }
  | { tipo: 'acao'; texto: string }
  | { tipo: 'respiro' }
  | { tipo: 'pausa' }

const ehAlfanumerico = (c: string | undefined) => c !== undefined && /[\p{L}\p{N}]/u.test(c)

/**
 * Interpreta as marcas de atuação de um texto:
 *   `/` respiro curto · `//` pausa maior · `**x**` ênfase · `*(x)*` ação (não falada).
 *
 * Uma barra só vale como marca se não estiver colada entre duas letras ou números
 * (assim "e/ou" continua sendo texto). Marcas sem fechamento viram texto comum.
 * Os espaços ao redor de `/` e `//` são descartados; o espaçamento visual é do CSS.
 */
export function parseMarcas(entrada: string): Marca[] {
  const marcas: Marca[] = []
  let texto = ''

  const fecharTexto = () => {
    if (texto) marcas.push({ tipo: 'texto', texto })
    texto = ''
  }

  let i = 0
  while (i < entrada.length) {
    if (entrada.startsWith('**', i)) {
      const fim = entrada.indexOf('**', i + 2)
      if (fim > i + 2) {
        fecharTexto()
        marcas.push({ tipo: 'enfase', texto: entrada.slice(i + 2, fim) })
        i = fim + 2
        continue
      }
    }

    if (entrada.startsWith('*(', i)) {
      const fim = entrada.indexOf(')*', i + 2)
      if (fim > i + 2) {
        fecharTexto()
        marcas.push({ tipo: 'acao', texto: entrada.slice(i + 2, fim) })
        i = fim + 2
        continue
      }
    }

    if (entrada[i] === '/') {
      const tamanho = entrada[i + 1] === '/' ? 2 : 1
      const colada = ehAlfanumerico(entrada[i - 1]) && ehAlfanumerico(entrada[i + tamanho])
      if (!colada) {
        fecharTexto()
        marcas.push({ tipo: tamanho === 2 ? 'pausa' : 'respiro' })
        i += tamanho
        continue
      }
    }

    texto += entrada[i]
    i += 1
  }
  fecharTexto()

  return aparar(marcas)
}

/** Tira os espaços que sobram nas bordas do texto e ao lado de respiros e pausas. */
function aparar(marcas: Marca[]): Marca[] {
  const resultado: Marca[] = []
  marcas.forEach((marca, indice) => {
    if (marca.tipo !== 'texto') {
      resultado.push(marca)
      return
    }
    const anterior = marcas[indice - 1]
    const seguinte = marcas[indice + 1]
    let { texto } = marca
    if (!anterior || anterior.tipo === 'respiro' || anterior.tipo === 'pausa') texto = texto.trimStart()
    if (!seguinte || seguinte.tipo === 'respiro' || seguinte.tipo === 'pausa') texto = texto.trimEnd()
    if (texto) resultado.push({ tipo: 'texto', texto })
  })
  return resultado
}
