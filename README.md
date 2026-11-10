# 🃏 Desafio de Teste: Truco Paulista (`desafio_teste_truco`)

Repositório contendo a implementação em JavaScript e a suíte de **casos de teste automatizados (Jest)** para validar as regras oficiais do **Truco Paulista para 02 duplas** (4 jogadores).

---

## 👥 Colaborador(es)

- Vinicius Ramon Ferreira (@ViniciusRFerreira)

---

## 📋 Regras do Truco Paulista Contempladas

1. **Baralho Limpo (40 cartas)**: Retiram-se os `8`, `9`, `10` e curingas. Ordem crescente das cartas comuns: `4 < 5 < 6 < 7 < Q < J < K < A < 2 < 3`.
2. **Vira e Manilha Variável**: A cada mão, vira-se uma carta (**Vira**). A **Manilha** é o valor imediatamente superior ao Vira na sequência cíclica (ex.: Vira `7` → Manilha `Q`; Vira `3` → Manilha `4`).
3. **Hierarquia das Manilhas por Naipe**:
   - ♦️ **Ouros** (Pica-fumo / Mole) < ♠️ **Espadas** (Espadilha) < ♥️ **Copas** < ♣️ **Paus** (Zap).
4. **Disputa em 02 Duplas (4 jogadores)**: Mesa intercalada (`J1 - Dupla 1`, `J2 - Dupla 2`, `J3 - Dupla 1`, `J4 - Dupla 2`), com 3 cartas por jogador a cada mão.
5. **Melhor de 3 Rodadas (Vazas) e Desempate ("Canga")**:
   - Empate na 1ª rodada: vence a mão quem ganhar a 2ª rodada.
   - Empate na 2ª ou na 3ª rodada: vence a mão quem ganhou a 1ª rodada.
   - Empate na 1ª e 2ª rodadas: vence a mão quem ganhar a 3ª rodada.
6. **Aumentos de Aposta (`Truco`, `Seis`, `Nove`, `Doze`)**: Escala `1 → 3 → 6 → 9 → 12` pontos, alternando obrigatoriamente entre as duplas.
7. **Mão de Onze e Mão de Ferro**: Mão de Onze inicia valendo 3 pontos (podendo correr por 1 ponto) e proíbe pedido de Truco; Mão de Ferro (`11 x 11`) decide a partida em 12 pontos.

---

## 🧪 Funcionamento dos Casos de Teste (`tests/truco.test.js`)

A suíte conta com **19 casos de teste** divididos em 7 grupos funcionais:

| ID | Caso de Teste | O que valida / Como funciona |
| :--- | :--- | :--- |
| **CT01** | Baralho limpo de 40 cartas | Instancia `BaralhoTruco` e verifica se possui exatamente 40 cartas e se os valores `8`, `9` e `10` foram excluídos. |
| **CT02** | Rejeição de cartas inválidas | Tenta criar instâncias de `Carta` com valores proibidos (`8`, `10`) ou naipes inexistentes e valida o lançamento de erro. |
| **CT03** | Cálculo cíclico da Manilha pelo Vira | Testa `obterValorManilha()` em todas as 10 transições da sequência cíclica (`4 → 5 → 6 → 7 → Q → J → K → A → 2 → 3 → 4`). |
| **CT04** | Hierarquia de naipes nas Manilhas | Dado um Vira, compara as 4 manilhas entre si garantindo `Paus (Zap) > Copas > Espadas > Ouros`. |
| **CT05** | Manilha vs Carta comum e Empate | Verifica que a manilha mais fraca (`Ouros`) vence um `3` comum, e que duas cartas comuns de mesmo valor empatam (`0`). |
| **CT06** | Validação das 02 duplas na mesa | Garante que a partida exige 2 jogadores por dupla e posiciona os 4 jogadores intercalados (`[1, 2, 1, 2]`). |
| **CT07** | Distribuição de cartas na mão | Verifica se cada um dos 4 jogadores recebe 3 cartas, se 1 carta Vira é definida e se restam 27 cartas no monte. |
| **CT08** | Vitória da mão em 2 vazas | Simula 2 rodadas completas com 4 jogadores jogando cartas e verifica se a Dupla 1 vence a mão e soma os pontos no placar. |
| **CT09** | Regras de empate ("Canga") nas vazas | Valida todos os cenários de empate na 1ª, 2ª e 3ª vazas no método estático `determinarVencedorMao()`. |
| **CT10** | Escalonamento de Truco, Seis, Nove e Doze | Testa a progressão `1 → 3 → 6 → 9 → 12` e garante que a mesma dupla é bloqueada de pedir aumento duas vezes seguidas. |
| **CT11** | Desistência ("Correr" do Truco) | Simula uma dupla correndo de um pedido de Seis e valida que a dupla solicitante recebe os 3 pontos vigentes anteriormente. |
| **CT12** | Regras da Mão de Onze | Com placar em `11 x 8`, valida que a mão começa valendo 3 pontos, bloqueia pedidos de Truco e concede 1 ponto ao adversário caso a dupla de 11 corra. |
| **CT13** | Mão de Ferro (`11 x 11`) e fim de jogo | Com placar em `11 x 11`, verifica que a mão vale 1 ponto e que o Truco é bloqueado. Depois a Dupla 2 vence as duas rodadas jogando as cartas, chega a 12 pontos e vence a partida. |
| **CT14** | Mão de Onze aceita | Fora da Mão de Onze a decisão não existe. Com `11 x 6`, só a dupla com 11 pontos decide, e ao aceitar a mão segue valendo 3 pontos. |
| **CT15** | Respostas e jogadas inválidas no pedido | Confere os erros ao responder sem pedido pendente, ao responder pela própria dupla que pediu, com ação desconhecida e ao jogar carta com pedido em aberto. |
| **CT16** | Canga na 1ª rodada em mão jogada | Empata a 1ª rodada com dois 3 comuns e a Dupla 2 vence a 2ª com a manilha (`[0, 2]`), levando a mão e 1 ponto. |
| **CT17** | Cartas inválidas | Confere os erros para jogador inexistente, índice de carta inválido e jogador que joga duas vezes na mesma rodada. |
| **CT18** | Canga na 2ª e na 3ª rodada em mãos jogadas | Simula jogadas reais com empate na 2ª rodada (`[1, 0]`) e empate na 3ª rodada (`[2, 1, 0]`), confirmando vitória de quem fez a 1ª rodada. |
| **CT19** | Canga nas duas primeiras rodadas e empate triplo | Simula jogadas reais para `[0, 0, 1]` (quem vence a 3ª leva a mão) e `[0, 0, 0]` (mão encerra com `vencedorMao = 0` e sem pontos), além de bloquear jogadas após o fim da mão. |

---

## Interface esperada pelos testes

O arquivo `src/truco.js` usa `module.exports` para exportar `{ Carta, BaralhoTruco, obterValorManilha, compararCartas, PartidaTrucoPaulista }`, importado nos testes com `require('../src/truco')`.

- `new Carta(valor, naipe)`: aceita valores `'4'`, `'5'`, `'6'`, `'7'`, `'Q'`, `'J'`, `'K'`, `'A'`, `'2'`, `'3'` e naipes `'Ouros'`, `'Espadas'`, `'Copas'`, `'Paus'`. Lança erro para qualquer outro valor ou naipe.
- `new BaralhoTruco()`: possui a propriedade `cartas` (array com 40 cartas).
- `obterValorManilha(vira)`: retorna o valor da manilha (string). `compararCartas(a, b, vira)`: retorna `1`, `-1` ou `0`.
- `new PartidaTrucoPaulista(dupla1 = [2 nomes], dupla2 = [2 nomes])`: exige 2 jogadores por dupla.
- Propriedades da partida: `jogadores` (4 jogadores intercalados, cada um com `id` de `'J1'` a `'J4'`, `dupla` 1 ou 2 e `mao`), `duplas[1].pontos` e `duplas[2].pontos`, `baralho`, `vira`, `valorMao`, `pedidoPendente` (com `novoValor`), `resultadosVazas`, `maoEncerrada`, `vencedorMao` e `vencedorPartida`.
- Métodos da partida: `iniciarNovaMao()`, `ehMaoDeOnze()`, `ehMaoDeFerro()`, `responderMaoDeOnze(dupla, aceitar)`, `pedirAumento(dupla)`, `responderPedido(dupla, 'aceitar' | 'correr' | 'aumentar')` e `jogarCarta(idJogador, indice)`.
- `PartidaTrucoPaulista.determinarVencedorMao(resultados)` (método estático): recebe a lista de resultados das rodadas (`1`, `2` ou `0` para empate) e retorna `1`, `2` ou `0`.

As mensagens de erro também são conferidas pelos testes; o texto exato esperado em cada caso está em `tests/truco.test.js`.

---

## 🚀 Como Executar os Testes

```bash
# 1. Instalar as dependências (Jest)
npm install

# 2. Executar a suíte de testes
npm test
```
