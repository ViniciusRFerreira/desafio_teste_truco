const {
  Carta,
  BaralhoTruco,
  obterValorManilha,
  compararCartas,
  PartidaTrucoPaulista
} = require('../src/truco');

describe('Truco Paulista (02 Duplas) - Suíte de Casos de Teste', () => {
  describe('1. Baralho Limpo e Criação de Cartas', () => {
    test('CT01 - Deve criar um baralho limpo de Truco Paulista com exatamente 40 cartas (sem 8, 9, 10 e curingas)', () => {
      const baralho = new BaralhoTruco();
      expect(baralho.cartas).toHaveLength(40);

      const valoresPresentes = new Set(baralho.cartas.map((c) => c.valor));
      expect(valoresPresentes.has('8')).toBe(false);
      expect(valoresPresentes.has('9')).toBe(false);
      expect(valoresPresentes.has('10')).toBe(false);
      expect(valoresPresentes.size).toBe(10);
    });

    test('CT02 - Deve rejeitar a criação de cartas com valores ou naipes inválidos', () => {
      expect(() => new Carta('8', 'Paus')).toThrow('Valor de carta inválido no Truco Paulista: 8');
      expect(() => new Carta('10', 'Copas')).toThrow('Valor de carta inválido no Truco Paulista: 10');
      expect(() => new Carta('A', 'Estrelas')).toThrow('Naipe inválido: Estrelas');
    });
  });

  describe('2. Definição do Vira, Manilha Variável e Hierarquia de Cartas', () => {
    test('CT03 - Deve definir corretamente a Manilha como a carta seguinte ao Vira na ordem cíclica', () => {
      expect(obterValorManilha(new Carta('4', 'Ouros'))).toBe('5');
      expect(obterValorManilha(new Carta('7', 'Copas'))).toBe('Q');
      expect(obterValorManilha(new Carta('Q', 'Espadas'))).toBe('J');
      expect(obterValorManilha(new Carta('J', 'Paus'))).toBe('K');
      expect(obterValorManilha(new Carta('K', 'Ouros'))).toBe('A');
      expect(obterValorManilha(new Carta('3', 'Paus'))).toBe('4'); // Cíclico: Vira 3 -> Manilha 4
    });

    test('CT04 - Deve respeitar a hierarquia de naipes entre Manilhas (Ouros < Espadas < Copas < Paus/Zap)', () => {
      const vira = new Carta('7', 'Ouros'); // Manilha é Q
      const picaFumo = new Carta('Q', 'Ouros');
      const espadilha = new Carta('Q', 'Espadas');
      const copas = new Carta('Q', 'Copas');
      const zap = new Carta('Q', 'Paus');

      expect(compararCartas(zap, copas, vira)).toBe(1);
      expect(compararCartas(copas, espadilha, vira)).toBe(1);
      expect(compararCartas(espadilha, picaFumo, vira)).toBe(1);
      expect(compararCartas(picaFumo, zap, vira)).toBe(-1);
    });

    test('CT05 - Qualquer Manilha deve vencer um 3 comum, e cartas comuns de mesmo valor devem empatar', () => {
      const vira = new Carta('4', 'Paus'); // Manilha é 5
      const manilhaOuros = new Carta('5', 'Ouros');
      const tresPaus = new Carta('3', 'Paus');
      const tresCopas = new Carta('3', 'Copas');

      expect(compararCartas(manilhaOuros, tresPaus, vira)).toBe(1);
      expect(compararCartas(tresPaus, tresCopas, vira)).toBe(0); // Empate ("canga")
    });
  });

  describe('3. Estrutura de 02 Duplas e Distribuição de Cartas', () => {
    test('CT06 - Deve exigir exatamente 2 duplas com 2 jogadores cada e intercalar na mesa', () => {
      expect(() => new PartidaTrucoPaulista(['J1'], ['J2', 'J4'])).toThrow(
        'O Truco de duplas exige exatamente 2 jogadores por dupla'
      );

      const partida = new PartidaTrucoPaulista(['Ana', 'Carlos'], ['Bruno', 'Diana']);
      expect(partida.jogadores.map((j) => j.dupla)).toEqual([1, 2, 1, 2]);
    });

    test('CT07 - Deve distribuir 3 cartas para cada um dos 4 jogadores e definir 1 carta Vira ao iniciar a mão', () => {
      const partida = new PartidaTrucoPaulista();
      partida.iniciarNovaMao();

      for (const jogador of partida.jogadores) {
        expect(jogador.mao).toHaveLength(3);
      }
      expect(partida.vira).toBeInstanceOf(Carta);
      // 40 cartas - (4 * 3) - 1 vira = 27 cartas restantes no monte
      expect(partida.baralho.cartas).toHaveLength(27);
    });
  });

  describe('4. Disputa de Rodadas (Vazas) e Regras de Desempate na Mão', () => {
    test('CT08 - Dupla que vence 2 rodadas leva a mão e soma os pontos correspondentes', () => {
      const partida = new PartidaTrucoPaulista();
      partida.iniciarNovaMao();
      partida.vira = new Carta('4', 'Ouros'); // Manilha: 5

      // Rodada 1: Dupla 1 vence com Zap (5 de Paus)
      partida.jogadores[0].mao = [new Carta('5', 'Paus'), new Carta('3', 'Copas'), new Carta('4', 'Paus')];
      partida.jogadores[1].mao = [new Carta('A', 'Espadas'), new Carta('2', 'Ouros'), new Carta('4', 'Espadas')];
      partida.jogadores[2].mao = [new Carta('6', 'Copas'), new Carta('7', 'Copas'), new Carta('Q', 'Copas')];
      partida.jogadores[3].mao = [new Carta('K', 'Paus'), new Carta('J', 'Paus'), new Carta('6', 'Ouros')];

      partida.jogarCarta('J1', 0);
      partida.jogarCarta('J2', 0);
      partida.jogarCarta('J3', 0);
      partida.jogarCarta('J4', 0);

      expect(partida.resultadosVazas).toEqual([1]);
      expect(partida.maoEncerrada).toBe(false);

      // Rodada 2: Dupla 1 vence novamente com 3 de Copas
      partida.jogarCarta('J1', 0);
      partida.jogarCarta('J2', 0);
      partida.jogarCarta('J3', 0);
      partida.jogarCarta('J4', 0);

      expect(partida.resultadosVazas).toEqual([1, 1]);
      expect(partida.maoEncerrada).toBe(true);
      expect(partida.vencedorMao).toBe(1);
      expect(partida.duplas[1].pontos).toBe(1);
    });

    test('CT09 - Regras de empate (Canga): empate na 1ª rodada dá vitória a quem vencer a 2ª; empate na 2ª ou 3ª dá vitória a quem venceu a 1ª', () => {
      // Empate na 1ª, Dupla 2 vence a 2ª -> Dupla 2 vence a mão
      expect(PartidaTrucoPaulista.determinarVencedorMao([0, 2])).toBe(2);

      // Dupla 1 vence a 1ª, Empate na 2ª -> Dupla 1 vence a mão
      expect(PartidaTrucoPaulista.determinarVencedorMao([1, 0])).toBe(1);

      // Dupla 2 vence a 1ª, Dupla 1 vence a 2ª, Empate na 3ª -> Dupla 2 vence a mão (fez a primeira)
      expect(PartidaTrucoPaulista.determinarVencedorMao([2, 1, 0])).toBe(2);

      // Empate na 1ª e na 2ª, Dupla 1 vence a 3ª -> Dupla 1 vence a mão
      expect(PartidaTrucoPaulista.determinarVencedorMao([0, 0, 1])).toBe(1);

      // Empate nas 3 rodadas -> Ninguém vence (0)
      expect(PartidaTrucoPaulista.determinarVencedorMao([0, 0, 0])).toBe(0);
    });
  });

  describe('5. Pedidos de Truco, Seis, Nove e Doze', () => {
    test('CT10 - Deve escalonar corretamente os valores da mão (1 -> 3 -> 6 -> 9 -> 12) e impedir que a mesma dupla aumente duas vezes seguidas', () => {
      const partida = new PartidaTrucoPaulista();
      partida.iniciarNovaMao();

      // Dupla 1 pede Truco (3)
      partida.pedirAumento(1);
      expect(partida.pedidoPendente.novoValor).toBe(3);

      // Dupla 2 aceita e na sequência aumenta para Seis (6), ou responde 'aumentar' direto
      partida.responderPedido(2, 'aceitar');
      expect(partida.valorMao).toBe(3);

      // Dupla 1 não pode pedir Seis porque acabou de pedir Truco
      expect(() => partida.pedirAumento(1)).toThrow(
        'A mesma dupla não pode pedir aumento duas vezes seguidas'
      );

      // Dupla 2 pede Seis (6) e Dupla 1 responde aumentando para Nove (9)
      partida.pedirAumento(2);
      partida.responderPedido(1, 'aumentar');
      expect(partida.pedidoPendente.novoValor).toBe(9);

      // Dupla 2 responde aumentando para Doze (12) e Dupla 1 aceita
      partida.responderPedido(2, 'aumentar');
      partida.responderPedido(1, 'aceitar');
      expect(partida.valorMao).toBe(12);

      // Não pode passar de 12
      expect(() => partida.pedirAumento(1)).toThrow(
        'O valor da mão já está no limite máximo (12 pontos)'
      );
    });

    test('CT11 - Quando uma dupla corre do pedido, a dupla solicitante recebe os pontos vigentes antes do aumento', () => {
      const partida = new PartidaTrucoPaulista();
      partida.iniciarNovaMao();

      // Dupla 1 pede Truco (valendo 1 -> 3), Dupla 2 aceita
      partida.pedirAumento(1);
      partida.responderPedido(2, 'aceitar');

      // Dupla 2 pede Seis (valendo 3 -> 6), Dupla 1 corre -> Dupla 2 ganha 3 pontos
      partida.pedirAumento(2);
      partida.responderPedido(1, 'correr');

      expect(partida.maoEncerrada).toBe(true);
      expect(partida.vencedorMao).toBe(2);
      expect(partida.duplas[2].pontos).toBe(3);
    });
  });

  describe('6. Mão de Onze, Mão de Ferro e Fechamento da Partida (12 pontos)', () => {
    test('CT12 - Em Mão de Onze, a mão começa valendo 3 pontos, não permite pedir Truco e permite correr perdendo apenas 1 ponto', () => {
      const partida = new PartidaTrucoPaulista();
      partida.duplas[1].pontos = 11;
      partida.duplas[2].pontos = 8;

      partida.iniciarNovaMao();
      expect(partida.ehMaoDeOnze()).toBe(true);
      expect(partida.valorMao).toBe(3);

      // Proibido pedir Truco na Mão de Onze
      expect(() => partida.pedirAumento(1)).toThrow(
        'Não é permitido pedir Truco na Mão de Onze ou Mão de Ferro'
      );

      // Se a Dupla 1 recusar a Mão de Onze, a Dupla 2 ganha apenas 1 ponto
      partida.responderMaoDeOnze(1, false);
      expect(partida.duplas[2].pontos).toBe(9);
      expect(partida.maoEncerrada).toBe(true);
    });

    test('CT13 - Em Mão de Ferro (11 x 11), a mão vale 1 ponto, proíbe pedido de Truco e quem vencer a mão fecha a partida em 12 pontos', () => {
      const partida = new PartidaTrucoPaulista();
      partida.duplas[1].pontos = 11;
      partida.duplas[2].pontos = 11;

      partida.iniciarNovaMao();
      partida.vira = new Carta('4', 'Ouros'); // Manilha: 5
      expect(partida.ehMaoDeFerro()).toBe(true);
      expect(partida.valorMao).toBe(1);
      expect(() => partida.pedirAumento(2)).toThrow(
        'Não é permitido pedir Truco na Mão de Onze ou Mão de Ferro'
      );

      // A Dupla 2 (J2 e J4) vence as duas rodadas: Zap (5 de Paus) na 1ª e 3 de Copas na 2ª
      partida.jogadores[0].mao = [new Carta('4', 'Copas'), new Carta('6', 'Paus'), new Carta('7', 'Paus')];
      partida.jogadores[1].mao = [new Carta('5', 'Paus'), new Carta('3', 'Copas'), new Carta('4', 'Espadas')];
      partida.jogadores[2].mao = [new Carta('6', 'Ouros'), new Carta('7', 'Ouros'), new Carta('Q', 'Ouros')];
      partida.jogadores[3].mao = [new Carta('6', 'Copas'), new Carta('7', 'Copas'), new Carta('J', 'Copas')];

      for (let rodada = 0; rodada < 2; rodada++) {
        for (const id of ['J1', 'J2', 'J3', 'J4']) {
          partida.jogarCarta(id, 0);
        }
      }

      expect(partida.maoEncerrada).toBe(true);
      expect(partida.vencedorMao).toBe(2);
      expect(partida.duplas[2].pontos).toBe(12);
      expect(partida.duplas[1].pontos).toBe(11);
      expect(partida.vencedorPartida).toBe(2);
      expect(() => partida.iniciarNovaMao()).toThrow('A partida já possui um vencedor');
    });

    test('CT14 - Em Mão de Onze, só a dupla com 11 pontos decide e, se aceitar, a mão segue valendo 3 pontos', () => {
      // Fora da Mão de Onze não existe essa decisão
      const partidaNormal = new PartidaTrucoPaulista();
      partidaNormal.iniciarNovaMao();
      expect(() => partidaNormal.responderMaoDeOnze(1, true)).toThrow('A partida não está em Mão de Onze');

      const partida = new PartidaTrucoPaulista();
      partida.duplas[1].pontos = 11;
      partida.duplas[2].pontos = 6;
      partida.iniciarNovaMao();

      // A dupla com 6 pontos não pode decidir pela Mão de Onze
      expect(() => partida.responderMaoDeOnze(2, true)).toThrow(
        'Apenas a dupla com 11 pontos pode decidir sobre a Mão de Onze'
      );

      partida.responderMaoDeOnze(1, true);
      expect(partida.valorMao).toBe(3);
      expect(partida.maoEncerrada).toBe(false);
      expect(partida.duplas[2].pontos).toBe(6);
    });
  });

  describe('7. Respostas e Jogadas Inválidas, e Empate (Canga) em uma Mão Jogada', () => {
    test('CT15 - Deve rejeitar resposta sem pedido pendente, resposta da própria dupla, ação desconhecida e carta jogada com pedido em aberto', () => {
      const partida = new PartidaTrucoPaulista();
      partida.iniciarNovaMao();

      expect(() => partida.responderPedido(2, 'aceitar')).toThrow('Não há pedido de truco pendente');

      partida.pedirAumento(1);
      expect(() => partida.pedirAumento(2)).toThrow('Já existe um pedido de aumento pendente de resposta');
      expect(() => partida.responderPedido(1, 'aceitar')).toThrow(
        'Apenas a dupla adversária pode responder ao pedido de truco'
      );
      expect(() => partida.responderPedido(2, 'pensar')).toThrow('Ação de resposta inválida: pensar');
      expect(() => partida.jogarCarta('J1', 0)).toThrow(
        'Há um pedido de truco pendente que precisa ser respondido'
      );
    });

    test('CT16 - Empate na 1ª rodada jogada (canga): a dupla que vencer a 2ª rodada leva a mão', () => {
      const partida = new PartidaTrucoPaulista();
      partida.iniciarNovaMao();
      partida.vira = new Carta('4', 'Ouros'); // Manilha: 5

      partida.jogadores[0].mao = [new Carta('3', 'Copas'), new Carta('4', 'Copas'), new Carta('6', 'Paus')];
      partida.jogadores[1].mao = [new Carta('3', 'Paus'), new Carta('5', 'Copas'), new Carta('4', 'Espadas')];
      partida.jogadores[2].mao = [new Carta('6', 'Ouros'), new Carta('7', 'Ouros'), new Carta('Q', 'Ouros')];
      partida.jogadores[3].mao = [new Carta('6', 'Copas'), new Carta('7', 'Copas'), new Carta('J', 'Copas')];

      // Rodada 1: melhor carta de cada dupla é um 3 comum, então empata
      for (const id of ['J1', 'J2', 'J3', 'J4']) {
        partida.jogarCarta(id, 0);
      }
      expect(partida.resultadosVazas).toEqual([0]);
      expect(partida.maoEncerrada).toBe(false);

      // Rodada 2: a Dupla 2 vence com a manilha (5 de Copas)
      for (const id of ['J1', 'J2', 'J3', 'J4']) {
        partida.jogarCarta(id, 0);
      }
      expect(partida.resultadosVazas).toEqual([0, 2]);
      expect(partida.maoEncerrada).toBe(true);
      expect(partida.vencedorMao).toBe(2);
      expect(partida.duplas[2].pontos).toBe(1);
      expect(partida.duplas[1].pontos).toBe(0);
    });

    test('CT17 - Deve rejeitar jogador inexistente, índice de carta inválido e jogador que tenta jogar duas vezes na mesma rodada', () => {
      const partida = new PartidaTrucoPaulista();
      partida.iniciarNovaMao();

      expect(() => partida.jogarCarta('J9', 0)).toThrow('Jogador inválido: J9');
      expect(() => partida.jogarCarta('J1', 5)).toThrow('Índice de carta inválido na mão do jogador');

      partida.jogarCarta('J1', 0);
      expect(() => partida.jogarCarta('J1', 0)).toThrow('O jogador J1 já jogou nesta rodada');
    });
  });
});
