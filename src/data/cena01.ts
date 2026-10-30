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

/** O que está em volta do corredor na mata. Só drone, fogo, sonar e rio têm imagem (veja VISTAS_ESCUTA). */
export type CamadaEscuta = 'passos' | 'drone' | 'fogo' | 'floresta' | 'sonar' | 'rio' | 'pulso' | 'batida'

/**
 * Onde o corredor está e o que acontece em volta dele (a imagem do painel da esquerda).
 * Na mata, o que aparece além das árvores (drone, fogo, sonar, rio) vem da `escuta` do take.
 */
export type Ambiente =
  | 'estrada'
  | 'parada'
  | 'zumbido'
  | 'holofote'
  | 'partida'
  | 'mata'
  | 'termico'
  | 'cerca'
  | 'patio'
  | 'galpao'
  | 'portao'
  | 'malha'
  | 'calmaria'
  | 'bunker'
  | 'predador'
  | 'mira'
  | 'ravina'
  | 'fenda'
  | 'leito'
  | 'barco'

/** Como cada ambiente aparece escrito sobre a imagem. */
export const AMBIENTES: Record<Ambiente, { lugar: string; agora: string }> = {
  estrada: { lugar: 'Na caminhonete do Dito', agora: 'Estrada de terra, noite. Ele dirige e puxa assunto.' },
  parada: { lugar: 'Na caminhonete do Dito', agora: 'Parados na beira da mata, motor em marcha lenta.' },
  zumbido: { lugar: 'Na caminhonete do Dito', agora: 'Um zumbido no céu. O rádio do painel falha.' },
  holofote: { lugar: 'Na caminhonete do Dito', agora: 'Um drone varre a estrada com o holofote.' },
  partida: { lugar: 'A pé, na beira da mata', agora: 'A caminhonete arranca e o drone vai atrás dela.' },
  mata: { lugar: 'Correndo na mata', agora: 'Noite, debaixo das árvores. O rádio de pulso na mão.' },
  termico: { lugar: 'Na mata, na mira da torre', agora: 'A câmera térmica do vigia achou um ponto quente: você.' },
  cerca: { lugar: 'Na beira do Setor 7', agora: 'A mata acaba. Pátio aberto, um galpão e o holofote girando.' },
  patio: { lugar: 'Atravessando o pátio', agora: 'Terra aberta até o galpão. O holofote está na outra ponta.' },
  galpao: { lugar: 'Na sombra do galpão', agora: 'Encostado na parede de zinco. A luz passa rente.' },
  portao: { lugar: 'Rumo ao portão sul', agora: 'O portão está fechando e os cães vêm atrás.' },
  malha: { lugar: 'Debaixo da malha fantasma', agora: 'Drones Varredores acima da copa. Uma rede térmica desce do céu.' },
  calmaria: { lugar: 'Na mata, fora da malha', agora: 'Tudo quieto. Entre as raízes, o chão acende verde, bem fraquinho.' },
  bunker: { lugar: 'Na mata, ouvindo o bunker', agora: 'A mata segue quieta. O alarme e o maçarico vêm todos pelo rádio.' },
  predador: { lugar: 'Na mata, com o Leo no rádio', agora: 'Uma sombra enorme desce sobre a copa. Rotores pesados, militares.' },
  mira: { lugar: 'Na mira do Drone Predador', agora: 'O laser vermelho travou na sua mochila. A ravina fica à direita.' },
  ravina: { lugar: 'Sprint até a ravina', agora: 'Duas pedras gigantes e uma fenda estreita. O laser procura de novo.' },
  fenda: { lugar: 'No fundo da fenda', agora: 'O Predador bateu nas pedras lá em cima. O fogo ilumina o desfiladeiro.' },
  leito: { lugar: 'No leito da ravina', agora: 'Água rasa entre paredes de pedra. Elas escondem o seu calor.' },
  barco: { lugar: 'No barco autônomo', agora: 'Descendo o rio no piloto automático, rumo à base segura.' },
}

/** O que aparece na mata para cada camada da escuta (as que não têm imagem ficam de fora). */
export const VISTAS_ESCUTA: Partial<Record<CamadaEscuta, string>> = {
  drone: 'drone varrendo acima da copa',
  fogo: 'brilho de fogo ao longe',
  sonar: 'ping de sonar vindo do rio',
  rio: 'o rio aparece entre as árvores',
}

/** Quem fala no take. */
export type Personagem = 'lis' | 'dito' | 'vigia' | 'leo' | 'invasor1' | 'invasor2'

/** Nome mostrado no cabeçalho de cada take. */
export const PERSONAGENS: Record<Personagem, { nome: string }> = {
  lis: { nome: 'Lis' },
  dito: { nome: 'Dito' },
  vigia: { nome: 'Vigia' },
  leo: { nome: 'Leo' },
  invasor1: { nome: 'Invasor 1' },
  invasor2: { nome: 'Invasor 2' },
}

export interface Take {
  /** Identificador único na cena. Os takes da Lis usam T01, T02…; os do Dito, D01…; os do vigia, V01…; os do Leo, L01…; os dos invasores, I01… */
  id: string
  /** Quem fala. Se faltar, é a Lis. */
  quem?: Personagem
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
  /** Onde o corredor está (a imagem do painel). Se faltar, continua o do take anterior. */
  ambiente?: Ambiente
  /** Sons que o sound design coloca ANTES deste take (aparecem como chips). */
  cuesAntes?: string[]
  /** Sons que o sound design coloca DEPOIS deste take. */
  cuesDepois?: string[]
  /** O que aparece em volta do corredor na mata. Se faltar, continua o do take anterior; `[]` limpa. */
  escuta?: CamadaEscuta[]
}

/** Título que aparece no topo do teleprompter. */
export const TITULO_CENA = 'A SEIVA · CENA 1'

/** Frequência em que o rádio se fixa quando o canal conecta (MHz). */
export const FREQUENCIA_MHZ = 88.3

/** A partir deste take o visor mostra o mini-radar com o pontinho se movendo. */
export const TAKE_INICIO_RADAR = 'T11'

export const cena01: Take[] = [
  // ---- Prólogo · a estrada (Dito) ---------------------------------------------
  {
    id: 'D01',
    quem: 'dito',
    tipo: 'fala',
    texto: 'Vinte anos rodando essa estrada… e nunca levei ninguém tão **calado**.',
    direcao: 'tranquilo, motorista que puxa assunto pra passar o tempo. Sorriso na voz',
    volume: 4,
    duracaoSeg: 7,
    radio: 'buscando',
    ambiente: 'estrada',
    cuesAntes: ['noite: caminhonete velha em estrada de terra, motor rouco, cascalho, grilos, rádio AM chiando no painel'],
  },
  {
    id: 'D02',
    quem: 'dito',
    tipo: 'fala',
    texto: 'Tudo bem, tudo bem. // Me pagaram pra não perguntar. // E eu sou **muito** bom nisso.',
    direcao: 'brincalhão, olhando de lado pro passageiro',
    volume: 4,
    duracaoSeg: 7,
    radio: 'buscando',
  },
  {
    id: 'D03',
    quem: 'dito',
    tipo: 'fala',
    texto: 'Só vou te contar uma coisa, tá? // Lá dentro da mata, de noite… o chão **acende**. // Verde. // Feito brasa fria.',
    direcao: 'a voz desce. Meio supersticioso, meio sério',
    volume: 3,
    duracaoSeg: 9,
    radio: 'buscando',
  },
  {
    id: 'D04',
    quem: 'dito',
    tipo: 'fala',
    texto: 'Minha vó dizia que era alma. // Eu? // Eu acho que é cogumelo. // *(ri)* Mas não piso lá, não.',
    direcao: 'ri de si mesmo',
    volume: 4,
    duracaoSeg: 6,
    radio: 'buscando',
  },
  {
    id: 'D05',
    quem: 'dito',
    tipo: 'fala',
    texto: 'Pronto, é aqui. // Daqui pra frente não passa carro. // Só **gente**.',
    direcao: 'prático, fim de viagem',
    volume: 4,
    duracaoSeg: 5,
    radio: 'buscando',
    ambiente: 'parada',
    cuesAntes: ['a caminhonete reduz e para no cascalho, motor em marcha lenta'],
  },
  {
    id: 'D06',
    quem: 'dito',
    tipo: 'fala',
    texto: 'Peraí… // *(silêncio)* // Isso aí não é **bicho**, não.',
    direcao: 'se assusta e baixa a voz. Escutando o zumbido',
    volume: 4,
    duracaoSeg: 5,
    radio: 'buscando',
    ambiente: 'zumbido',
    cuesAntes: ['zumbido agudo nasce no alto, longe, e vai crescendo; o rádio do painel começa a falhar'],
  },
  {
    id: 'D07',
    quem: 'dito',
    tipo: 'fala',
    texto: 'É **drone**! // Ele tá vendo o motor, / o **calor** do motor. // Não você.',
    direcao: 'entende tudo de uma vez. Alarmado, fala rápido, sem pausa',
    volume: 6,
    duracaoSeg: 7,
    radio: 'buscando',
    ambiente: 'holofote',
    cuesAntes: ['facho de luz branca passa por cima das árvores e varre a estrada'],
  },
  {
    id: 'D08',
    quem: 'dito',
    tipo: 'fala',
    texto: 'Então é fácil. // Eu acelero pro outro lado, / ele vem atrás de mim. // A mata é **sua**. // Vai, **desce**!',
    direcao: 'urgente e rápido. Sem heroísmo: resolve o problema e manda o corredor descer já',
    volume: 5,
    duracaoSeg: 8,
    radio: 'buscando',
  },
  {
    id: 'D09',
    quem: 'dito',
    tipo: 'fala',
    texto: 'Se o chão acender, / lembra do Dito. // Boa sorte, **calado**.',
    direcao: 'com pressa, já engatando a marcha. Ainda com meio sorriso',
    volume: [5, 3],
    duracaoSeg: 6,
    radio: 'buscando',
    ambiente: 'partida',
    cuesDepois: [
      'porta batendo; a caminhonete arranca e some, o zumbido do drone vai atrás dela até sumir',
      'só a floresta e os passos do corredor entre as folhas; um chiado nasce no rádio de pulso',
    ],
  },

  // ---- Bloco 1 · Linha aberta (Lis) --------------------------------------------
  {
    id: 'T01',
    tipo: 'fala',
    texto: 'Tá, tá, tá… / vai. // **Conecta.** / Conecta, por favor.',
    direcao: 'colada no microfone, ofegante, olhando por cima do ombro',
    volume: 3,
    duracaoSeg: 4,
    radio: 'buscando',
    ambiente: 'mata',
    cuesAntes: ['do lado dela: alarme baixo e distante, algo queimando, ventilação, estática'],
  },
  {
    id: 'T02',
    tipo: 'fala',
    texto: 'Alô? // Na escuta? // Na escuta?! // Aqui é a **Lis**!',
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
    texto: 'Eu tô te ouvindo. // Esses passos… isso. // Você já tá na mata. // **Ótimo**.',
    direcao: 'já operando, clara. "Esses passos…" é ela ouvindo',
    volume: 5,
    duracaoSeg: 6,
    radio: 'conectado',
    escuta: ['passos'],
  },
  {
    id: 'T04b',
    tipo: 'fala',
    texto:
      'Aquele motor indo embora… / era o Dito, né? // *(respira)* Ele sabia o risco. // Então **escuta**, / porque eu só vou falar uma vez.',
    direcao: 'a voz cai. Ela ouviu o motor sumindo e sabe o que significa. Não chora: engole',
    volume: 4,
    duracaoSeg: 9,
    radio: 'conectado',
  },

  // ---- Bloco 2 · O que você carrega (Lis) --------------------------------------
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
      'Dentro dele tá a seiva. // Dez anos da minha vida. // Energia limpa, de graça, pra todo mundo… // Era pra **salvar tudo**.',
    direcao: 'rápida, sem respirar, e a última frase desaba',
    volume: [5, 3],
    duracaoSeg: 9,
    radio: 'conectado',
  },
  {
    id: 'T07',
    tipo: 'fala',
    texto:
      'Só que a Vanguarda do Norte descobriu que dá pra virar **arma**. // Uma arma que **apaga a vida**… de continentes inteiros.',
    direcao: 'a voz cai. Sem dramatizar, devagar',
    volume: 4,
    duracaoSeg: 10,
    radio: 'alerta',
    cuesAntes: ['drone grave'],
    escuta: ['passos', 'drone'],
  },
  {
    id: 'T08',
    tipo: 'fala',
    texto: 'Por isso eu queimei o laboratório. // **Tudo**. // Dez anos numa noite. // Esse frasco é o que sobrou.',
    direcao: 'seca. "Tudo." sozinho, com peso',
    volume: 4,
    duracaoSeg: 8,
    radio: 'alerta',
    cuesAntes: ['fogo distante, bem baixo'],
    escuta: ['passos', 'drone', 'fogo'],
  },

  // ---- Bloco 3 · Por que você, e pra onde (Lis) --------------------------------
  {
    id: 'T09',
    tipo: 'fala',
    texto:
      'Você viu a caminhonete, né? // Motor **esquenta**, motor faz **barulho**. // É assim que eles caçam: barco, drone, sonar.',
    direcao: 'rápida, lógica. Usa o que acabou de acontecer como prova',
    volume: 5,
    duracaoSeg: 9,
    radio: 'conectado',
    cuesAntes: ['floresta, ping de sonar discreto'],
    escuta: ['passos', 'floresta', 'sonar'],
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
    escuta: ['passos', 'floresta', 'sonar', 'rio'],
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
