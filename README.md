# Rádio Dra. Lis

Simulador do rádio da Dra. Lis conectando, com o texto de **A Seiva** passando ao lado, para ler enquanto você grava a voz. O app não grava nada e não faz nenhum som: ele só ajuda a atuar.

O capítulo 1 tem cinco cenas, escolhidas no seletor ao lado do título. Cada cena lembra o take em que você parou.

| Cena | O que acontece | Quem fala |
|---|---|---|
| 1 | O Dito leva o corredor até a mata, o drone, o primeiro contato da Lis | Dito, Lis |
| 2 | O Setor 7: o pátio, o galpão, o portão sul e a malha fantasma | Vigia, Lis |
| 3 | A calmaria e o bunker da Lis invadido; o rádio cai em estática | Lis |
| 4 | O rádio pula para a 104.7, o Leo entra e o Drone Predador chega | Leo, voz do sistema |
| 5 | A ravina, o drone cai, o barco e o fim do capítulo | Leo |

Os textos ficam em `src/data/cena01.ts` a `cena05.ts`, e a lista das cenas em `src/data/cenas.ts`. O que segue abaixo descreve a cena 1 em detalhe.

A cena abre com o **prólogo do Dito** (D01 a D09), o mateiro que leva o corredor de caminhonete até a mata, e segue com a Lis (T01 a T14, mais o T04b). Cada take mostra o nome de quem fala.

Atrás do rádio, a imagem mostra **onde o corredor está** em cada take, para você atuar dentro da cena: dentro da caminhonete do Dito na estrada de terra (rodando, parada, o zumbido no céu, o holofote do drone varrendo a estrada), a caminhonete indo embora com o drone atrás e, da Lis em diante, a mata à noite com o corredor correndo. Na mata, o que aparece em volta segue o campo `escuta` do take: drone acima da copa, fogo ao longe, sonar e o rio. Uma legenda no alto diz o lugar e o que está acontecendo. Quem decide é o campo `ambiente` de cada take em `src/data/cena01.ts` (se faltar, continua o do take anterior).

## Como rodar

Clique duas vezes em `iniciar.bat` (instala o que faltar e abre o navegador), ou no terminal:

```bash
npm install
npm run dev
```

Abra <http://localhost:5173>. Precisa do Node 20 ou mais novo.

Outros comandos: `npm test` (testes do interpretador de marcas), `npm run build` (confere os tipos e gera `dist/`).

## Como usar na gravação

O rádio fica sempre ligado e segue o take sozinho. Ele não faz som e não tem botão: é só a referência de como está o sinal e de quando tem alguém falando no canal.

1. Nos primeiros takes da Lis (**T01** e **T02**) o visor mostra "BUSCANDO CANAL…", com o sinal fraco e oscilando.
2. Ao passar para o take em que o canal conecta, o visor mostra "CANAL SEGURO ESTABELECIDO" por alguns segundos e as barras de sinal sobem. Essa linha é a voz do sistema: **não se grava**.
3. Nos takes de alerta (na cena 1, o **T07** e o **T08**) o LED do canal fica âmbar e o sinal fica instável. A partir do **T11** aparece um mini-radar no visor.
4. No último take, "Próximo" vira **Encerrar TX** e o visor mostra "TX ENCERRADO" (ou "SINAL PERDIDO", na cena 3).

### Atalhos

| Tecla | Ação |
| --- | --- |
| `Espaço` ou `→` | próximo take |
| `←` | take anterior |
| `G` | marcar o take como gravado |
| `+` e `-` | tamanho da letra |
| `Esc` | fecha a legenda |

`Espaço` sempre avança, mesmo com um botão em foco; para apertar um botão pelo teclado use `Enter`. Clicar num take salta para ele. As marcas ✓, o tamanho da letra, "Rolar sozinho" e o take atual ficam salvos no navegador. "Zerar marcas" fica no fim da lista.

### Marcas do texto

| Marca | Significa |
| --- | --- |
| `/` | respiro curto |
| `//` | pausa maior |
| `**palavra**` | palavra com mais peso |
| `*(ação)*` | ação, não é falada |

O botão **Tutorial** abre uma janela que explica cada símbolo do texto, cada elemento de um take (quem fala, direção, chips de som, voz do sistema) e o que o rádio mostra, e o botão **Legenda** é a versão rápida com os atalhos. Os cues de som (chips "SOM") são só para você saber o que o sound design vai colocar.

## Como editar o roteiro

Todo o texto está em [`src/data/cena01.ts`](src/data/cena01.ts). Cada take tem `id`, `tipo` (`'fala'` ou `'sistema'`), `texto`, `direcao`, `volume` (um número ou `[de, até]`; fica só no arquivo, não aparece na tela), `duracaoSeg`, `radio` (`'buscando'`, `'conectado'`, `'alerta'` ou `'fim'`) e, se quiser, `cuesAntes` e `cuesDepois`. Para mudar o que aparece em volta do corredor na mata, use `escuta` (lista de camadas; só `'drone'`, `'fogo'`, `'sonar'` e `'rio'` têm imagem; vale deste take em diante, e `[]` limpa). A ordem do arquivo é a ordem na tela, e o campo `radio` de cada take decide o estado do rádio. Salve o arquivo e a página atualiza sozinha. O interpretador das marcas fica em `src/lib/marcas.ts`.

## Privacidade

O app roda inteiro no seu computador: não usa CDN, fontes da web nem analytics, e não faz nenhuma chamada de rede.
