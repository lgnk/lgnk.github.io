import type { ImageMetadata } from 'astro';
import beerpass from '../assets/cases/beerpass.jpg';
import avance from '../assets/cases/avance.jpg';
import inkaboxe from '../assets/cases/inkaboxe.jpg';
import jmAtacado from '../assets/cases/jm-atacado.jpg';
import pedroPorto from '../assets/cases/pedro-porto.jpg';
import silverSchuffner from '../assets/cases/silver-schuffner.png';

/**
 * Vídeo: arquivos em public/cases/<slug>/video.webm|mp4, com a imagem como capa.
 * "soon": o vídeo novo ainda vai ser gravado (espaço reservado com a nuvem).
 */
export type CaseMedia =
  | { type: 'video'; poster: ImageMetadata }
  | { type: 'image'; image: ImageMetadata; alt: string }
  | { type: 'soon'; poster: ImageMetadata };

export interface Case {
  slug: string;
  name: string;
  /** Uma linha: o que é o projeto. */
  kind: string;
  problem: string;
  built: string;
  result: string;
  /** Etiquetas que dizem resultado, não tecnologia. */
  outcomes: string[];
  href: string | null;
  media: CaseMedia;
}

// Fatos confirmados pelo Ian em docs/cases-fatos.md (local). Rascunhos ainda a confirmar: problema da JM Atacado,
// do Pedro Porto e da Silver Schuffner.
export const cases: Case[] = [
  {
    slug: 'beerpass',
    name: 'Beerpass Club',
    kind: 'Autoatendimento de chope',
    problem: 'Fila para comprar e servir chope, mesmo com as torneiras de autoatendimento.',
    built:
      'Levamos o autoatendimento para as maquininhas Stone e PagBank (app Beerpass MESmart), com recarga no app do cliente pela Safe2Pay e estações de venda 24 horas.',
    result: 'O cliente compra, recarrega e se serve sozinho, a qualquer hora.',
    outcomes: ['Paga na maquininha', 'Recarga pelo app', 'Venda 24 horas'],
    href: 'https://www.beerpassclub.com/',
    media: { type: 'soon', poster: beerpass },
  },
  {
    slug: 'avance',
    name: 'Avance Trainer',
    kind: 'App para personal trainers · produto próprio',
    problem: 'Um app para a dieta, outro para o treino, outro para o resto: o treinador se espalhava em mil lugares.',
    built: 'Um lugar só para treinador e aluno: treino, dieta, avaliação e cobrança no app, mais um painel na web.',
    result: 'Mais de 6 treinadores e 80 alunos cadastrados, fora quem treina sozinho pelo app. Nota 5,0 nas lojas.',
    outcomes: ['Tudo num app só', 'Nota 5,0 nas lojas'],
    href: 'https://avancetrainer.com',
    media: { type: 'video', poster: avance },
  },
  {
    slug: 'pedro-porto',
    name: 'Pedro Porto Studios',
    kind: 'Portfólio e loja de roupas',
    problem: 'Portfólio preso numa plataforma pronta e nenhum jeito de vender as roupas pela internet.',
    built: 'O site do designer refeito em código e uma loja com Pix, cartão e frete.',
    result: 'Pronta para vender: Mercado Pago e Melhor Envio integrados.',
    outcomes: ['Pix e cartão', 'Frete calculado'],
    href: 'https://pedroportodesign.online',
    media: { type: 'video', poster: pedroPorto },
  },
  {
    slug: 'silver-schuffner',
    name: 'Silver Schuffner',
    kind: 'Vitrine de joias',
    problem: 'Clientes pedindo foto e preço de peça por peça no WhatsApp.',
    built: 'Uma vitrine de joias e gemas com pedido direto pelo WhatsApp.',
    result: 'Em desenvolvimento.',
    outcomes: ['Pedido pelo WhatsApp'],
    href: null,
    media: { type: 'image', image: silverSchuffner, alt: 'Página inicial do site da Silver Schuffner: joias com a sua pedra' },
  },
  {
    slug: 'jm-atacado',
    name: 'JM Atacado',
    kind: 'Catálogo de atacado da JM Calçados',
    problem: 'Pedido de atacado chegando picado no WhatsApp, foto por foto, com a grade montada na mão.',
    built:
      'Um catálogo em que o lojista escolhe os modelos e as grades fechadas de cada cor, e o pedido sai pronto no WhatsApp do vendedor. Cada vendedor tem o seu link.',
    result: 'O pedido chega completo, do jeito que a fábrica vende: em grade fechada.',
    outcomes: ['Pedido pronto no WhatsApp', 'Um link por vendedor'],
    href: '/jm-atacado/',
    media: { type: 'image', image: jmAtacado, alt: 'Catálogo da JM Calçados: chinelos no atacado, em grade de 12 pares' },
  },
  {
    slug: 'inkaboxe',
    name: 'InkaBoxe',
    kind: 'Academia de boxe · check-in pelo rosto',
    problem: 'Fila no check-in da recepção, mensalidade vencida passando batido e internet que caía.',
    built: 'Um tablet na entrada que reconhece o aluno pelo rosto e mostra na hora se a mensalidade está em dia.',
    result: 'Reconhece o aluno pelo rosto mesmo sem internet.',
    outcomes: ['Funciona sem internet', 'Mensalidade conferida na hora'],
    href: null,
    media: { type: 'video', poster: inkaboxe },
  },
];
