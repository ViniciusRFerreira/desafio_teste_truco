/**
 * Implementação das regras do Truco Paulista para 02 Duplas (4 jogadores).
 */

const VALORES_CARTAS = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];
const NAIPES = ['Ouros', 'Espadas', 'Copas', 'Paus']; // Ordem crescente de força na manilha

const FORCA_NAIPE_MANILHA = {
  Ouros: 1,   // Pica-fumo / Mole
  Espadas: 2, // Espadilha
  Copas: 3,   // Copas
  Paus: 4     // Zap
};

const ESCALA_TRUCO = [1, 3, 6, 9, 12];

class Carta {
  constructor(valor, naipe) {
    if (!VALORES_CARTAS.includes(valor)) {
      throw new Error(`Valor de carta inválido no Truco Paulista: ${valor}`);
    }
    if (!NAIPES.includes(naipe)) {
      throw new Error(`Naipe inválido: ${naipe}`);
    }
    this.valor = valor;
    this.naipe = naipe;
  }

  toString() {
    return `${this.valor} de ${this.naipe}`;
  }
}

class BaralhoTruco {
  constructor() {
    this.cartas = [];
    this.reiniciar();
  }

  reiniciar() {
    this.cartas = [];
    for (const naipe of NAIPES) {
      for (const valor of VALORES_CARTAS) {
        this.cartas.push(new Carta(valor, naipe));
      }
    }
  }

  embaralhar() {
    for (let i = this.cartas.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cartas[i], this.cartas[j]] = [this.cartas[j], this.cartas[i]];
    }
  }

  comprar() {
    if (this.cartas.length === 0) {
      throw new Error('O baralho está vazio');
    }
    return this.cartas.pop();
  }
}

/**
 * Retorna qual é o valor da Manilha a partir da carta Vira (Truco Paulista).
 * A manilha é a carta imediatamente seguinte ao Vira na ordem cíclica.
 */
function obterValorManilha(cartaVira) {
  if (!cartaVira || !VALORES_CARTAS.includes(cartaVira.valor)) {
    throw new Error('Carta Vira inválida');
  }
  const idx = VALORES_CARTAS.indexOf(cartaVira.valor);
  const proxIdx = (idx + 1) % VALORES_CARTAS.length;
  return VALORES_CARTAS[proxIdx];
}

/**
 * Calcula a força numérica de uma carta considerando o Vira atual.
 * Cartas comuns têm força de 0 a 9 (independente do naipe).
 * Manilhas têm força de 100 + força do naipe (101 a 104).
 */
function calcularForcaCarta(carta, cartaVira) {
  const valorManilha = obterValorManilha(cartaVira);
  if (carta.valor === valorManilha) {
    return 100 + FORCA_NAIPE_MANILHA[carta.naipe];
  }
  return VALORES_CARTAS.indexOf(carta.valor);
}

/**
 * Compara duas cartas considerando o Vira.
 * Retorna:
 *   1 se cartaA vence cartaB
 *  -1 se cartaB vence cartaA
 *   0 se houver empate ("canga")
 */
function compararCartas(cartaA, cartaB, cartaVira) {
  const forcaA = calcularForcaCarta(cartaA, cartaVira);
  const forcaB = calcularForcaCarta(cartaB, cartaVira);

  if (forcaA > forcaB) return 1;
  if (forcaB > forcaA) return -1;
  return 0;
}

class PartidaTrucoPaulista {
  constructor(dupla1Nomes = ['Jogador 1', 'Jogador 3'], dupla2Nomes = ['Jogador 2', 'Jogador 4']) {
    if (!Array.isArray(dupla1Nomes) || dupla1Nomes.length !== 2 || !Array.isArray(dupla2Nomes) || dupla2Nomes.length !== 2) {
      throw new Error('O Truco de duplas exige exatamente 2 jogadores por dupla (4 jogadores no total)');
    }

    this.duplas = {
      1: { id: 1, jogadores: dupla1Nomes, pontos: 0 },
      2: { id: 2, jogadores: dupla2Nomes, pontos: 0 }
    };

    // Mesa intercalada: J1 (D1), J2 (D2), J3 (D1), J4 (D2)
    this.jogadores = [
      { id: 'J1', nome: dupla1Nomes[0], dupla: 1, mao: [] },
      { id: 'J2', nome: dupla2Nomes[0], dupla: 2, mao: [] },
      { id: 'J3', nome: dupla1Nomes[1], dupla: 1, mao: [] },
      { id: 'J4', nome: dupla2Nomes[1], dupla: 2, mao: [] }
    ];

    this.baralho = new BaralhoTruco();
    this.vira = null;
    this.valorMao = 1;
    this.ultimaDuplaAPedirAumento = null;
    this.pedidoPendente = null; // { duplaSolicitante, novoValor, valorAnterior }
    this.resultadosVazas = []; // Ex: [1, 2, 0] (1 = Dupla 1, 2 = Dupla 2, 0 = Empate)
    this.vazaAtual = []; // [{ jogadorId, dupla, carta }]
    this.maoEncerrada = false;
    this.vencedorMao = null;
    this.vencedorPartida = null;
  }

  iniciarNovaMao() {
    if (this.vencedorPartida) {
      throw new Error('A partida já possui um vencedor');
    }

    this.baralho.reiniciar();
    this.baralho.embaralhar();

    for (const jogador of this.jogadores) {
      jogador.mao = [
        this.baralho.comprar(),
        this.baralho.comprar(),
        this.baralho.comprar()
      ];
    }

    this.vira = this.baralho.comprar();
    this.resultadosVazas = [];
    this.vazaAtual = [];
    this.maoEncerrada = false;
    this.vencedorMao = null;
    this.ultimaDuplaAPedirAumento = null;
    this.pedidoPendente = null;

    // Verifica Mão de Onze (apenas uma dupla tem 11 pontos)
    if (this.ehMaoDeOnze()) {
      this.valorMao = 3;
    } else {
      this.valorMao = 1;
    }
  }

  ehMaoDeOnze() {
    const p1 = this.duplas[1].pontos;
    const p2 = this.duplas[2].pontos;
    return (p1 === 11 && p2 < 11) || (p2 === 11 && p1 < 11);
  }

  ehMaoDeFerro() {
    return this.duplas[1].pontos === 11 && this.duplas[2].pontos === 11;
  }

  /**
   * Permite que a dupla que está na Mão de Onze decida se aceita ou corre antes de jogar.
   * Se recusar, a dupla adversária ganha 1 ponto.
   */
  responderMaoDeOnze(duplaId, aceitar) {
    if (!this.ehMaoDeOnze()) {
      throw new Error('A partida não está em Mão de Onze');
    }
    if (this.duplas[duplaId].pontos !== 11) {
      throw new Error('Apenas a dupla com 11 pontos pode decidir sobre a Mão de Onze');
    }

    if (aceitar) {
      this.valorMao = 3;
    } else {
      const adversario = duplaId === 1 ? 2 : 1;
      this.valorMao = 1;
      this._finalizarMao(adversario, 1);
    }
  }

  /**
   * Solicita aumento de aposta (Truco = 3, Seis = 6, Nove = 9, Doze = 12).
   */
  pedirAumento(duplaSolicitante) {
    if (this.maoEncerrada) {
      throw new Error('A mão já foi encerrada');
    }
    if (this.ehMaoDeOnze() || this.ehMaoDeFerro()) {
      // No Truco Paulista, pedir truco em Mão de Onze ou Mão de Ferro é proibido
      throw new Error('Não é permitido pedir Truco na Mão de Onze ou Mão de Ferro');
    }
    if (this.pedidoPendente) {
      throw new Error('Já existe um pedido de aumento pendente de resposta');
    }
    if (this.ultimaDuplaAPedirAumento === duplaSolicitante) {
      throw new Error('A mesma dupla não pode pedir aumento duas vezes seguidas');
    }

    const idxAtual = ESCALA_TRUCO.indexOf(this.valorMao);
    if (idxAtual === -1 || idxAtual >= ESCALA_TRUCO.length - 1) {
      throw new Error('O valor da mão já está no limite máximo (12 pontos)');
    }

    const novoValor = ESCALA_TRUCO[idxAtual + 1];
    this.pedidoPendente = {
      duplaSolicitante,
      valorAnterior: this.valorMao,
      novoValor
    };

    return this.pedidoPendente;
  }

  /**
   * A dupla adversária responde ao pedido: 'aceitar', 'correr' ou 'aumentar'.
   */
  responderPedido(duplaRespondente, acao) {
    if (!this.pedidoPendente) {
      throw new Error('Não há pedido de truco pendente');
    }
    if (duplaRespondente === this.pedidoPendente.duplaSolicitante) {
      throw new Error('Apenas a dupla adversária pode responder ao pedido de truco');
    }

    const { duplaSolicitante, valorAnterior, novoValor } = this.pedidoPendente;

    if (acao === 'aceitar') {
      this.valorMao = novoValor;
      this.ultimaDuplaAPedirAumento = duplaSolicitante;
      this.pedidoPendente = null;
    } else if (acao === 'correr') {
      this.pedidoPendente = null;
      this._finalizarMao(duplaSolicitante, valorAnterior);
    } else if (acao === 'aumentar') {
      this.valorMao = novoValor;
      this.ultimaDuplaAPedirAumento = duplaSolicitante;
      this.pedidoPendente = null;
      this.pedirAumento(duplaRespondente);
    } else {
      throw new Error(`Ação de resposta inválida: ${acao}`);
    }
  }

  /**
   * Registra a carta jogada por um jogador na vaza atual.
   */
  jogarCarta(jogadorId, indiceCarta = 0) {
    if (this.maoEncerrada) {
      throw new Error('A mão já está encerrada');
    }
    if (this.pedidoPendente) {
      throw new Error('Há um pedido de truco pendente que precisa ser respondido');
    }

    const jogador = this.jogadores.find((j) => j.id === jogadorId);
    if (!jogador) {
      throw new Error(`Jogador inválido: ${jogadorId}`);
    }
    if (this.vazaAtual.some((jogada) => jogada.jogadorId === jogadorId)) {
      throw new Error(`O jogador ${jogadorId} já jogou nesta rodada`);
    }
    if (indiceCarta < 0 || indiceCarta >= jogador.mao.length) {
      throw new Error('Índice de carta inválido na mão do jogador');
    }

    const [carta] = jogador.mao.splice(indiceCarta, 1);
    this.vazaAtual.push({
      jogadorId: jogador.id,
      dupla: jogador.dupla,
      carta
    });

    if (this.vazaAtual.length === 4) {
      this._avaliarVaza();
    }

    return carta;
  }

  /**
   * Avalia quem venceu a vaza de 4 cartas (melhor carta da Dupla 1 vs melhor carta da Dupla 2).
   */
  _avaliarVaza() {
    const jogadasD1 = this.vazaAtual.filter((j) => j.dupla === 1);
    const jogadasD2 = this.vazaAtual.filter((j) => j.dupla === 2);

    const maiorD1 = jogadasD1.reduce((melhor, atual) =>
      compararCartas(atual.carta, melhor.carta, this.vira) > 0 ? atual : melhor
    );
    const maiorD2 = jogadasD2.reduce((melhor, atual) =>
      compararCartas(atual.carta, melhor.carta, this.vira) > 0 ? atual : melhor
    );

    const comparacao = compararCartas(maiorD1.carta, maiorD2.carta, this.vira);
    let resultadoVaza = 0; // 0 = empate
    if (comparacao > 0) resultadoVaza = 1;
    if (comparacao < 0) resultadoVaza = 2;

    this.resultadosVazas.push(resultadoVaza);
    this.vazaAtual = [];

    const vencedor = PartidaTrucoPaulista.determinarVencedorMao(this.resultadosVazas);
    if (vencedor !== null) {
      if (vencedor === 0) {
        // 3 empates seguidos: ninguém ganha pontos
        this.maoEncerrada = true;
        this.vencedorMao = 0;
      } else {
        this._finalizarMao(vencedor, this.valorMao);
      }
    }
  }

  /**
   * Regras oficiais de desempate de vazas no Truco Paulista:
   * - Retorna 1 (Dupla 1 venceu), 2 (Dupla 2 venceu), 0 (empate total nas 3 vazas), ou null (mão ainda em andamento).
   */
  static determinarVencedorMao(resultadosVazas) {
    const n = resultadosVazas.length;
    if (n < 2) return null;

    const v1 = resultadosVazas[0];
    const v2 = resultadosVazas[1];

    const vitoriasD1 = resultadosVazas.filter((r) => r === 1).length;
    const vitoriasD2 = resultadosVazas.filter((r) => r === 2).length;

    if (vitoriasD1 === 2) return 1;
    if (vitoriasD2 === 2) return 2;

    // Caso de 2 vazas jogadas:
    if (n === 2) {
      // Se empatou a 1ª, quem fizer a 2ª leva
      if (v1 === 0 && v2 !== 0) return v2;
      // Se alguém fez a 1ª e a 2ª empatou, quem fez a 1ª leva
      if (v1 !== 0 && v2 === 0) return v1;
      // Se ambas empataram (0, 0) ou cada dupla ganhou uma (1, 2 ou 2, 1), vai para a 3ª vaza
      return null;
    }

    // Caso de 3 vazas jogadas:
    const v3 = resultadosVazas[2];
    if (v1 === 0 && v2 === 0) {
      return v3; // Se v3 for 1 ou 2, vence; se for 0, retorna 0 (empate triplo)
    }

    // Se cada dupla ganhou uma nas duas primeiras (ex: 1 e 2) e a 3ª empatou, vence quem ganhou a 1ª!
    if (v3 === 0) {
      return v1;
    }

    return v3;
  }

  _finalizarMao(duplaVencedora, pontosGanhos) {
    this.maoEncerrada = true;
    this.vencedorMao = duplaVencedora;
    this.duplas[duplaVencedora].pontos += pontosGanhos;

    if (this.duplas[duplaVencedora].pontos >= 12) {
      this.duplas[duplaVencedora].pontos = 12;
      this.vencedorPartida = duplaVencedora;
    }
  }
}

module.exports = {
  VALORES_CARTAS,
  NAIPES,
  FORCA_NAIPE_MANILHA,
  ESCALA_TRUCO,
  Carta,
  BaralhoTruco,
  obterValorManilha,
  calcularForcaCarta,
  compararCartas,
  PartidaTrucoPaulista
};
