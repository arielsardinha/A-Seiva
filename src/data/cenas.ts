import { FREQUENCIA_MHZ, TAKE_INICIO_RADAR, TITULO_CENA, cena01, type Take } from './cena01'
import { TAKE_INICIO_RADAR_02, TITULO_CENA_02, cena02 } from './cena02'
import { TAKE_FIM_RADAR_03, TAKE_INICIO_RADAR_03, TITULO_CENA_03, cena03 } from './cena03'
import { FREQUENCIA_CENA_04, TAKE_INICIO_RADAR_04, TITULO_CENA_04, cena04 } from './cena04'
import { TAKE_INICIO_RADAR_05, TEXTO_FIM_05, TITULO_CENA_05, cena05 } from './cena05'

/** Uma cena do teleprompter. Para acrescentar a próxima, crie cenaNN.ts e ponha aqui. */
export interface Cena {
  /** Usado para lembrar o take atual e os gravados de cada cena. */
  id: string
  titulo: string
  takes: Take[]
  /** A partir deste take o visor mostra o mini-radar com o pontinho se movendo. */
  takeInicioRadar: string
  /** A partir deste take o mini-radar some (a Lis perdeu a tela). */
  takeFimRadar?: string
  /**
   * Como a transmissão termina depois do último take: 'encerrada' (TX ENCERRADO, silêncio)
   * ou 'caiu' (SINAL PERDIDO, só estática). Se faltar, é 'encerrada'.
   */
  fim?: 'encerrada' | 'caiu'
  /** Frequência em que o rádio se fixa (MHz). Se faltar, é a do canal da Lis. */
  frequencia?: number
  /** O que a imagem diz depois do último take. Se faltar, vale o texto padrão do fim da transmissão. */
  textoFim?: string
}

export const CENAS: Cena[] = [
  { id: 'cena01', titulo: TITULO_CENA, takes: cena01, takeInicioRadar: TAKE_INICIO_RADAR },
  { id: 'cena02', titulo: TITULO_CENA_02, takes: cena02, takeInicioRadar: TAKE_INICIO_RADAR_02 },
  {
    id: 'cena03',
    titulo: TITULO_CENA_03,
    takes: cena03,
    takeInicioRadar: TAKE_INICIO_RADAR_03,
    takeFimRadar: TAKE_FIM_RADAR_03,
    fim: 'caiu',
  },
  {
    id: 'cena04',
    titulo: TITULO_CENA_04,
    takes: cena04,
    takeInicioRadar: TAKE_INICIO_RADAR_04,
    frequencia: FREQUENCIA_CENA_04,
  },
  {
    id: 'cena05',
    titulo: TITULO_CENA_05,
    takes: cena05,
    takeInicioRadar: TAKE_INICIO_RADAR_05,
    frequencia: FREQUENCIA_CENA_04,
    textoFim: TEXTO_FIM_05,
  },
]

/** Frequência do rádio na cena (MHz). */
export const frequenciaDaCena = (cena: Cena) => cena.frequencia ?? FREQUENCIA_MHZ
