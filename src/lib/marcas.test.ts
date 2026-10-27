import { describe, expect, it } from 'vitest'
import { cena01 } from '../data/cena01'
import { parseMarcas } from './marcas'

describe('parseMarcas', () => {
  it('devolve texto simples como um único pedaço', () => {
    expect(parseMarcas('Na escuta?')).toEqual([{ tipo: 'texto', texto: 'Na escuta?' }])
  })

  it('reconhece respiro curto e pausa maior', () => {
    expect(parseMarcas('Tá, tá, tá… / vai. // Conecta.')).toEqual([
      { tipo: 'texto', texto: 'Tá, tá, tá…' },
      { tipo: 'respiro' },
      { tipo: 'texto', texto: 'vai.' },
      { tipo: 'pausa' },
      { tipo: 'texto', texto: 'Conecta.' },
    ])
  })

  it('reconhece ênfase e mantém o espaço antes dela', () => {
    expect(parseMarcas('Ai, meu **Deus**. // Conectou.')).toEqual([
      { tipo: 'texto', texto: 'Ai, meu ' },
      { tipo: 'enfase', texto: 'Deus' },
      { tipo: 'texto', texto: '.' },
      { tipo: 'pausa' },
      { tipo: 'texto', texto: 'Conectou.' },
    ])
  })

  it('reconhece ação e mantém o espaço depois dela', () => {
    expect(parseMarcas('*(respira)* Tá. / Calma, Lis. / **Foco.**')).toEqual([
      { tipo: 'acao', texto: 'respira' },
      { tipo: 'texto', texto: ' Tá.' },
      { tipo: 'respiro' },
      { tipo: 'texto', texto: 'Calma, Lis.' },
      { tipo: 'respiro' },
      { tipo: 'enfase', texto: 'Foco.' },
    ])
  })

  it('descarta o espaço entre uma ênfase e o separador seguinte', () => {
    expect(parseMarcas('**Conecta.** / Conecta, por favor.')).toEqual([
      { tipo: 'enfase', texto: 'Conecta.' },
      { tipo: 'respiro' },
      { tipo: 'texto', texto: 'Conecta, por favor.' },
    ])
  })

  it('não trata "e/ou" como respiro', () => {
    expect(parseMarcas('sim e/ou não')).toEqual([{ tipo: 'texto', texto: 'sim e/ou não' }])
  })

  it('deixa marcas sem fechamento como texto comum', () => {
    expect(parseMarcas('uma **ênfase aberta')).toEqual([{ tipo: 'texto', texto: 'uma **ênfase aberta' }])
    expect(parseMarcas('ação *(aberta')).toEqual([{ tipo: 'texto', texto: 'ação *(aberta' }])
  })

  it('aceita separadores nas bordas do texto', () => {
    expect(parseMarcas('// Oi /')).toEqual([{ tipo: 'pausa' }, { tipo: 'texto', texto: 'Oi' }, { tipo: 'respiro' }])
  })

  it('devolve lista vazia para texto vazio', () => {
    expect(parseMarcas('')).toEqual([])
  })
})

describe('roteiro da cena 1', () => {
  it('interpreta todos os takes sem sobrar marcação crua', () => {
    for (const take of cena01) {
      const marcas = parseMarcas(take.texto)
      expect(marcas.length, take.id).toBeGreaterThan(0)
      for (const marca of marcas) {
        if (marca.tipo === 'texto') expect(marca.texto, take.id).not.toMatch(/\*\*|\*\(|\)\*|\//)
      }
    }
  })

  it('mantém o volume dentro do limite de 7', () => {
    for (const take of cena01.filter((t) => t.tipo === 'fala')) {
      const volumes = typeof take.volume === 'number' ? [take.volume] : take.volume
      for (const v of volumes) expect(v, take.id).toBeLessThanOrEqual(7)
    }
  })
})
