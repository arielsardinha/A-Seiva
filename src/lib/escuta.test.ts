import { describe, expect, it } from 'vitest'
import { cena01, type Take } from '../data/cena01'
import { camadasDoTake } from './escuta'

const take = (id: string, extra: Partial<Take> = {}): Take => ({
  id,
  tipo: 'fala',
  texto: 'x',
  direcao: 'x',
  volume: 3,
  duracaoSeg: 1,
  radio: 'conectado',
  ...extra,
})

describe('camadasDoTake', () => {
  const falas = [
    take('A'),
    take('B', { escuta: ['passos'] }),
    take('C'),
    take('D', { escuta: ['passos', 'drone'] }),
    take('E', { escuta: [], escutaFim: ['pulso'] }),
  ]

  it('fica em silêncio antes de qualquer camada ser definida', () => {
    expect(camadasDoTake(falas, 0, false)).toEqual([])
  })

  it('mantém a camada do take anterior quando o take não define nada', () => {
    expect(camadasDoTake(falas, 2, false)).toEqual(['passos'])
  })

  it('troca a lista quando o take define outra', () => {
    expect(camadasDoTake(falas, 3, false)).toEqual(['passos', 'drone'])
  })

  it('`escuta: []` silencia as camadas herdadas', () => {
    expect(camadasDoTake(falas, 4, false)).toEqual([])
  })

  it('usa escutaFim quando a transmissão acabou', () => {
    expect(camadasDoTake(falas, 4, true)).toEqual(['pulso'])
    expect(camadasDoTake(falas, 3, true)).toEqual([])
  })
})

describe('escuta na cena 1', () => {
  const falasCena = cena01.filter((t) => t.tipo === 'fala')
  const em = (id: string) => camadasDoTake(falasCena, falasCena.findIndex((t) => t.id === id), false)

  it('não tem nada para ouvir enquanto o canal busca (T01 e T02) nem no T03', () => {
    expect(em('T01')).toEqual([])
    expect(em('T02')).toEqual([])
    expect(em('T03')).toEqual([])
  })

  it('segue os cues do roteiro', () => {
    expect(em('T04')).toContain('passos')
    expect(em('T07')).toContain('drone')
    expect(em('T08')).toContain('fogo')
    expect(em('T09')).toEqual(expect.arrayContaining(['floresta', 'sonar']))
    expect(em('T09')).not.toContain('drone')
    expect(em('T12')).toContain('rio')
  })

  it('entra pulso e batida quando a TX termina no T14', () => {
    expect(camadasDoTake(falasCena, falasCena.length - 1, true)).toEqual(['pulso', 'batida'])
  })
})
