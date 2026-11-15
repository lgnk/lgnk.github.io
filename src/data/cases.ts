import type { ImageMetadata } from 'astro';
import beerpass from '../assets/cases/beerpass.jpg';
import avance from '../assets/cases/avance.jpg';
import inkaboxe from '../assets/cases/inkaboxe.jpg';
import pedroPorto from '../assets/cases/pedro-porto.jpg';
import silverSchuffner from '../assets/cases/silver-schuffner.png';

export interface Case {
  slug: string;
  name: string;
  summary: string;
  tags: string[];
  href: string | null;
  image: ImageMetadata;
  imageAlt: string;
}

export const cases: Case[] = [
  {
    slug: 'beerpass',
    name: 'Beerpass Club',
    summary: 'Autoatendimento de chope rodando direto na maquininha',
    tags: ['Arquitetura', 'POS'],
    href: 'https://www.beerpassclub.com/',
    image: beerpass,
    imageAlt: 'App Beerpass servindo chope: toque, puxe a alavanca e pague só o que servir',
  },
  {
    slug: 'avance',
    name: 'Avance Trainer',
    summary: 'Plataforma para personal trainers — produto próprio, 5,0★',
    tags: ['App', 'SaaS'],
    href: 'https://avancetrainer.com',
    image: avance,
    imageAlt: 'Telas do app do aluno no Avance Trainer: treino do dia, séries e cargas',
  },
  {
    slug: 'inkaboxe',
    name: 'InkaBoxe',
    summary: 'Check-in por reconhecimento facial numa academia, sem internet',
    tags: ['IA', 'Offline'],
    href: null,
    image: inkaboxe,
    imageAlt: 'Tablet do InkaBoxe identificando um aluno por reconhecimento facial',
  },
  {
    slug: 'pedro-porto',
    name: 'Pedro Porto Studios',
    summary: 'Portfólio do designer refeito em código e loja de roupas sob demanda com Pix, cartão e frete',
    tags: ['Portfólio', 'Loja virtual'],
    href: 'https://pedroportodesign.online',
    image: pedroPorto,
    imageAlt: 'Portfólio do designer Pedro Porto reconstruído em código',
  },
  {
    slug: 'silver-schuffner',
    name: 'Silver Schuffner',
    summary: 'Vitrine de joias e gemas com pedido pelo WhatsApp',
    tags: ['Site vitrine'],
    href: null,
    image: silverSchuffner,
    imageAlt: 'Página inicial do site da Silver Schuffner: joias com a sua pedra',
  },
];
