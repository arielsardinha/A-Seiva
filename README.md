# Rádio Dra. Lis

Simulador do rádio da Dra. Lis conectando, com o texto de **A Seiva** passando ao lado, para ler enquanto você grava a voz. O app não grava nada: ele só ajuda a atuar.

O capítulo 1 tem cinco cenas, escolhidas no seletor ao lado do título. Cada cena lembra o take em que você parou.

| Cena | O que acontece | Quem fala |
|---|---|---|
| 1 | O Dito leva o corredor até a mata, o drone, o primeiro contato da Lis | Dito (voz natural), Lis (RVC) |
| 2 | O Setor 7: o pátio, o galpão, o portão sul e a malha fantasma | Vigia (voz natural), Lis |
| 3 | A calmaria e o bunker da Lis invadido; o rádio cai em estática | Lis |
| 4 | O rádio pula para a 104.7, o Leo entra e o Drone Predador chega | Leo (RVC do Leo), voz do sistema |
| 5 | A ravina, o drone cai, o barco e o fim do capítulo | Leo |

Os textos ficam em `src/data/cena01.ts` a `cena05.ts`, e a lista das cenas em `src/data/cenas.ts`. O que segue abaixo descreve a cena 1 em detalhe.

A cena abre com o **prólogo do Dito** (D01 a D09), o mateiro que leva o corredor de caminhonete até a mata, e segue com a Lis (T01 a T14, mais o T04b). Cada take mostra quem fala e como gravar: a Lis passa pelo RVC, o Dito é a sua voz natural.

Atrás do rádio, a imagem mostra **onde o corredor está** em cada take, para você atuar dentro da cena: dentro da caminhonete do Dito na estrada de terra (rodando, parada, o zumbido no céu, o holofote do drone varrendo a estrada), a caminhonete indo embora com o drone atrás e, da Lis em diante, a mata à noite com o corredor correndo. Na mata, o que aparece em volta segue o roteiro: drone acima da copa, fogo ao longe, sonar e o rio. Uma legenda no alto diz o lugar e o que está acontecendo. Quem decide é o campo `ambiente` de cada take em `src/data/cena01.ts` (se faltar, continua o do take anterior).

## Como rodar

Clique duas vezes em `iniciar.bat` (instala o que faltar e abre o navegador), ou no terminal:

```bash
npm install
npm run dev
```

Abra <http://localhost:5173>. Precisa do Node 20 ou mais novo.

Outros comandos: `npm test` (testes do interpretador de marcas), `npm run build` (confere os tipos e gera `dist/`).

## Como usar na gravação

1. **Ligar o rádio**: clique de power, visor "INICIANDO…" e depois "BUSCANDO CANAL…". O rádio fica buscando durante o prólogo do Dito e enquanto você fala o **T01** e o **T02**.
2. Ao passar do T02 para o T03 (ou ao apertar **Conectar canal**, que pula direto para o T03) o rádio faz o bipe e mostra "CANAL SEGURO ESTABELECIDO". Essa linha é a voz do sistema: **não se grava**.
3. No **T07** e no **T08** o rádio entra em alerta (LED âmbar, mais ruído). Do **T09** volta ao normal. A partir do **T11** aparece um mini-radar no visor.
4. No **T14**, "Próximo" vira **Encerrar TX** e o visor mostra "TX ENCERRADO".

O rádio é opcional: o teleprompter funciona com ele desligado.

### O que a Dra. Lis ouve

O interruptor **O que a Dra. Lis ouve** (ou a tecla `E`) toca, depois que o canal conectou, o que ela ouve pelo rádio, para você atuar reagindo a isso: passos do corredor, drone grave, fogo distante, floresta com ping de sonar, rio ao longe e, quando você encerra a TX no T14, o pulso e a batida de corrida. Abaixo do interruptor aparece o que está tocando no take atual ("Ouvindo agora: …").

- Só toca com o rádio ligado e o canal conectado (do T03 em diante). Nos T01 e T02 ela só ouve o chiado do rádio buscando, que é o interruptor "Sons do rádio".
- **O chiado some assim que o canal conecta.** Do T03 em diante o canal fica limpo.
- Os dois interruptores são independentes: dá para ouvir só um deles.
- São sons sintetizados e baixos, um guia para a interpretação, não a mixagem final do sound design.

### Atalhos

| Tecla | Ação |
| --- | --- |
| `Espaço` ou `→` | próximo take |
| `←` | take anterior |
| `G` | marcar o take como gravado |
| `F` | tela cheia |
| `E` | liga e desliga "O que a Dra. Lis ouve" |
| `+` e `-` | tamanho da letra |
| `Esc` | fecha a legenda |

`Espaço` sempre avança, mesmo com um botão em foco; para apertar um botão pelo teclado use `Enter`. Clicar num take salta para ele. As marcas ✓, o tamanho da letra, "Rolar sozinho", o alto contraste e o take atual ficam salvos no navegador. "Zerar marcas" fica no fim da lista.

### Marcas do texto

| Marca | Significa |
| --- | --- |
| `/` | respiro curto |
| `//` | pausa maior |
| `**palavra**` | palavra com mais peso |
| `*(ação)*` | ação, não é falada |

O botão **Tutorial** abre uma janela que explica cada símbolo do texto (e cada elemento de um take: volume, direção, chips de som, voz do sistema) com exemplos, e o botão **Legenda** é a versão rápida com os atalhos. O volume alvo vai de 1 a 10 e **nunca passa de 7**; os cues de som (chips "SOM") são só para você saber o que o sound design vai colocar.

## Como editar o roteiro

Todo o texto está em [`src/data/cena01.ts`](src/data/cena01.ts). Cada take tem `id`, `tipo` (`'fala'` ou `'sistema'`), `texto`, `direcao`, `volume` (um número ou `[de, até]`), `duracaoSeg`, `radio` (`'buscando'`, `'conectado'`, `'alerta'` ou `'fim'`) e, se quiser, `cuesAntes` e `cuesDepois`. Para mudar o que ela ouve, use `escuta` (lista de camadas: `'passos'`, `'drone'`, `'fogo'`, `'floresta'`, `'sonar'`, `'rio'`, `'pulso'`, `'batida'`; vale deste take em diante, e `[]` silencia) e `escutaFim` (o que entra ao encerrar a TX). Os passos começam no T04 para você ouvi-los em "Esses passos…"; mova `'passos'` para o T05 se preferir seguir o cue à risca. A ordem do arquivo é a ordem na tela, e o campo `radio` de cada take decide o estado do rádio. Salve o arquivo e a página atualiza sozinha. O interpretador das marcas fica em `src/lib/marcas.ts`.

## Áudio

Os sons do rádio (chiado, bipes, cliques) e o que a Dra. Lis ouve são sintetizados no navegador e **começam mudos**. Só tocam depois que você liga o interruptor **Sons do rádio** ou **O que a Dra. Lis ouve**.

> **Use fones.** O som do app pode vazar para o microfone e sujar a gravação.

## Privacidade

O app roda inteiro no seu computador: não usa CDN, fontes da web nem analytics, e não faz nenhuma chamada de rede.
