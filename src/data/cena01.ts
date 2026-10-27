// =============================================================================
//  A SEIVA · CENA 1 · roteiro para gravar a voz da Dra. Lis
//
//  Este é o único arquivo que você precisa editar para mudar o texto.
//  Marcas que valem dentro de `texto`:
//    /            respiro curto            (separe com espaços: "vai. / Conecta")
//    //           pausa maior
//    **palavra**  palavra com mais peso
//    *(ação)*     ação ou som que NÃO é falado, ex.: *(respira)*
// =============================================================================

export type EstadoRadioTake = 'buscando' | 'conectado' | 'alerta' | 'fim'

export interface Take {
  /** Identificador único. Os takes de fala usam T01, T02… */
  id: string
  /** 'fala' = você grava. 'sistema' = voz do sistema no visor, NÃO se grava. */
  tipo: 'fala' | 'sistema'
  /** Texto com as marcas acima. Em 'sistema', é a mensagem que aparece no visor. */
  texto: string
  /** Direção de atuação, aparece em itálico. */
  direcao: string
  /** Volume alvo de 1 a 10 (nunca acima de 7). Use [3, 7] para "3 → 7". Ignorado em 'sistema'. */
  volume: number | readonly [number, number]
  /** Duração estimada em segundos. Ignorado em 'sistema'. */
  duracaoSeg: number
  /** Estado visual do rádio enquanto este take está na tela. */
  radio: EstadoRadioTake
  /** Sons que o sound design coloca ANTES deste take (aparecem como chips). */
  cuesAntes?: string[]
  /** Sons que o sound design coloca DEPOIS deste take. */
  cuesDepois?: string[]
}

/** Título que aparece no topo do teleprompter. */
export const TITULO_CENA = 'A SEIVA · CENA 1'

/** Frequência em que o rádio se fixa quando o canal conecta (MHz). */
export const FREQUENCIA_MHZ = 88.3

/** A partir deste take o visor mostra o mini-radar com o pontinho se movendo. */
export const TAKE_INICIO_RADAR = 'T11'

export const cena01: Take[] = [
  {
    id: 'T01',
    tipo: 'fala',
    texto: 'Tá, tá, tá… / vai. // **Conecta.** / Conecta, por favor.',
    direcao: 'colada no microfone, ofegante, olhando por cima do ombro',
    volume: 3,
    duracaoSeg: 4,
    radio: 'buscando',
    cuesAntes: ['alarme baixo e distante, algo queimando, ventilação, estática'],
  },
  {
    id: 'T02',
    tipo: 'fala',
    texto: 'Na escuta? / Na escuta?! // Aqui é a **Lis**!',
    direcao: 'a voz sobe de uma vez. Fique abaixo do 7 no "Lis"',
    volume: [3, 7],
    duracaoSeg: 3,
    radio: 'buscando',
  },
  {
    id: 'SIS',
    tipo: 'sistema',
    texto: 'Canal seguro estabelecido.',
    direcao: 'aqui o rádio conecta',
    volume: 0,
    duracaoSeg: 0,
    radio: 'conectado',
    cuesAntes: ['bipe de confirmação'],
  },
  {
    id: 'T03',
    tipo: 'fala',
    texto: 'Ai, meu **Deus**. // Conectou. / Conectou! // *(respira)* Tá. / Calma, Lis. / **Foco.**',
    direcao: 'solta o ar, depois se recompõe',
    volume: [5, 3],
    duracaoSeg: 5,
    radio: 'conectado',
  },
  {
    id: 'T04',
    tipo: 'fala',
    texto:
      'Eu tô te ouvindo. // Esses passos… / você já tá correndo. / Ótimo. // Então **escuta**, / porque eu só vou falar **uma vez**.',
    direcao: 'já operando, clara. "Esses passos…" é ela ouvindo',
    volume: 5,
    duracaoSeg: 9,
    radio: 'conectado',
    cuesDepois: ['entram os passos do corredor'],
  },
  {
    id: 'T05',
    tipo: 'fala',
    texto:
      'Aí na sua mochila tem um frasco. // Pequeno. // Parece nada. // E é a **única coisa** no mundo que eles querem.',
    direcao: 'direta, uma ideia por frase',
    volume: 5,
    duracaoSeg: 8,
    radio: 'conectado',
  },
  {
    id: 'T06',
    tipo: 'fala',
    texto:
      'Dentro dele tá a seiva. / Dez anos de trabalho. / Energia limpa, / de graça, / pra todo mundo. // Era pra **salvar tudo**.',
    direcao: 'rápida, sem respirar, e a última frase desaba',
    volume: [5, 3],
    duracaoSeg: 9,
    radio: 'conectado',
  },
  {
    id: 'T07',
    tipo: 'fala',
    texto:
      'Mas a Vanguarda do Norte descobriu que dá pra virar **arma**. // Uma arma que **apaga a vida**. // De continentes inteiros.',
    direcao: 'a voz cai. Sem dramatizar, devagar',
    volume: 4,
    duracaoSeg: 10,
    radio: 'alerta',
    cuesAntes: ['drone grave'],
  },
  {
    id: 'T08',
    tipo: 'fala',
    texto: 'Por isso eu queimei o laboratório. // **Tudo.** // Dez anos numa noite. // Esse frasco é tudo que sobrou.',
    direcao: 'seca. "Tudo." sozinho, com peso',
    volume: 4,
    duracaoSeg: 8,
    radio: 'alerta',
    cuesAntes: ['fogo distante, bem baixo'],
  },
  {
    id: 'T09',
    tipo: 'fala',
    texto:
      'E sim, eu sei que você deve estar pensando: / por que **eu**? // Eles caçam por **calor** e por **barulho**. / Barcos, / drones, / sonar.',
    direcao: 'rápida, lógica, quase falando sozinha',
    volume: 5,
    duracaoSeg: 8,
    radio: 'conectado',
    cuesAntes: ['floresta, ping de sonar discreto'],
  },
  {
    id: 'T10',
    tipo: 'fala',
    texto:
      'E você, sozinho, debaixo das árvores? // Pra máquina, você é quase **nada**. // **Quase.** // Foi por isso que eu te escolhi.',
    direcao: 'baixa e calorosa no fim. As pausas fazem o gancho',
    volume: 4,
    duracaoSeg: 9,
    radio: 'conectado',
  },
  {
    id: 'T11',
    tipo: 'fala',
    texto: 'Eu tô te vendo aqui na tela. // Um pontinho se mexendo no meio do mato.',
    direcao: 'operadora, olhando uma tela',
    volume: 5,
    duracaoSeg: 8,
    radio: 'conectado',
  },
  {
    id: 'T12',
    tipo: 'fala',
    texto:
      'Do outro lado do rio tem um ponto de extração. // É pra lá que esse pontinho vai, / e eu vou te avisando de cada **passo**.',
    direcao: 'objetiva, passo a passo',
    volume: 5,
    duracaoSeg: 9,
    radio: 'conectado',
    cuesAntes: ['rio ao longe'],
  },
  {
    id: 'T13',
    tipo: 'fala',
    texto: 'Nós somos os **guardiões** agora.',
    direcao: 'promessa, firme e calorosa',
    volume: 5,
    duracaoSeg: 3,
    radio: 'conectado',
  },
  {
    id: 'T14',
    tipo: 'fala',
    texto: 'Mantenha o **ritmo**.',
    direcao: 'seca, baixa, com som, não sussurro',
    volume: 3,
    duracaoSeg: 2,
    radio: 'fim',
    cuesDepois: ['o pulso volta, entra a batida de corrida'],
  },
]
