import { describe, expect, it } from 'vitest'
import { cena01 } from '../data/cena01'
import { cena02 } from '../data/cena02'
import { cena03 } from '../data/cena03'
import { cena04 } from '../data/cena04'
import { cena05 } from '../data/cena05'
import { ambienteDoTake } from './ambiente'

describe('ambiente na cena 1', () => {
  const falas = cena01.filter((t) => t.tipo === 'fala')
  const em = (id: string) => ambienteDoTake(falas, falas.findIndex((t) => t.id === id))

  it('começa na caminhonete com o Dito, rodando', () => {
    expect(em('D01')).toBe('estrada')
    expect(em('D04')).toBe('estrada')
  })

  it('segue o que acontece na estrada', () => {
    expect(em('D05')).toBe('parada')
    expect(em('D06')).toBe('zumbido')
    expect(em('D07')).toBe('holofote')
    expect(em('D08')).toBe('holofote')
    expect(em('D09')).toBe('partida')
  })

  it('fica na mata da Lis em diante', () => {
    for (const fala of falas.filter((t) => t.quem !== 'dito')) expect(em(fala.id), fala.id).toBe('mata')
  })
})

describe('ambiente na cena 2', () => {
  const falas = cena02.filter((t) => t.tipo === 'fala')
  const em = (id: string) => ambienteDoTake(falas, falas.findIndex((t) => t.id === id))

  it('começa na mata e mostra a câmera térmica quando o vigia acha o ponto quente', () => {
    expect(em('T01')).toBe('mata')
    expect(em('V02')).toBe('mata')
    expect(em('V03')).toBe('termico')
    expect(em('V05')).toBe('termico')
    expect(em('T03')).toBe('mata')
  })

  it('segue a travessia do pátio', () => {
    expect(em('T06')).toBe('cerca')
    expect(em('T11')).toBe('cerca')
    expect(em('T12')).toBe('patio')
    expect(em('T15')).toBe('patio')
    expect(em('T16')).toBe('galpao')
    expect(em('T20')).toBe('galpao')
    expect(em('T21')).toBe('portao')
    expect(em('T23')).toBe('portao')
  })

  it('volta pra mata depois do portão e termina debaixo da malha fantasma', () => {
    expect(em('T24')).toBe('mata')
    expect(em('T25')).toBe('mata')
    expect(em('T26')).toBe('malha')
    expect(em('T33')).toBe('malha')
  })
})

describe('ambiente na cena 3', () => {
  const falas = cena03.filter((t) => t.tipo === 'fala')
  const em = (id: string) => ambienteDoTake(falas, falas.findIndex((t) => t.id === id))

  it('sai da malha e entra na calmaria do chão aceso', () => {
    expect(em('T01')).toBe('malha')
    expect(em('T02')).toBe('mata')
    expect(em('T04')).toBe('calmaria')
    expect(em('T12')).toBe('calmaria')
  })

  it('fica na mata ouvindo o bunker do alarme até o fim', () => {
    expect(em('T13')).toBe('bunker')
    expect(em('T30')).toBe('bunker')
  })
})

describe('ambiente na cena 4', () => {
  const falas = cena04.filter((t) => t.tipo === 'fala')
  const em = (id: string) => ambienteDoTake(falas, falas.findIndex((t) => t.id === id))

  it('o Leo entra com o corredor na mata', () => {
    expect(em('L01')).toBe('mata')
    expect(em('L12')).toBe('mata')
  })

  it('o Predador chega e trava a mira até o "Agora!"', () => {
    expect(em('L13')).toBe('predador')
    expect(em('L22')).toBe('predador')
    expect(em('L23')).toBe('mira')
    expect(em('L30')).toBe('mira')
  })
})

describe('ambiente na cena 5', () => {
  const falas = cena05.filter((t) => t.tipo === 'fala')
  const em = (id: string) => ambienteDoTake(falas, falas.findIndex((t) => t.id === id))

  it('corre até a ravina e cai na fenda com o drone pegando fogo', () => {
    expect(em('L01')).toBe('ravina')
    expect(em('L06')).toBe('ravina')
    expect(em('L07')).toBe('fenda')
    expect(em('L10')).toBe('fenda')
  })

  it('segue pelo leito e termina o capítulo no barco', () => {
    expect(em('L11')).toBe('leito')
    expect(em('L18')).toBe('leito')
    expect(em('L19')).toBe('barco')
    expect(em('L28')).toBe('barco')
  })
})
