import type { PixelIcon } from '../lib/icons';

/** Logos em public/logos/<logo>.svg: limpas (sem script), enquadradas e mostradas num tom só (preto) pelo CSS. */
export interface Client {
  name: string;
  segment: string;
  logo: string;
}

export interface Integration {
  name: string;
  logo: string;
  /** A logo já traz o nome escrito: o texto fica só para leitores de tela. */
  wordmark: boolean;
  /** Altura da logo em px, para as letras de marcas diferentes parecerem do mesmo tamanho. */
  height: number;
}

export interface IntegrationGroup {
  group: string;
  icon: PixelIcon;
  items: Integration[];
}

/** Quem já contou com a gente. O Avance Trainer é produto próprio, por isso não entra aqui. */
export const clients: Client[] = [
  { name: 'Beerpass Club', segment: 'Autoatendimento de chope', logo: 'beerpass' },
  { name: 'Heineken', segment: 'Cervejaria', logo: 'heineken' },
  { name: 'Shelflix', segment: 'Missões em pontos de venda', logo: 'shelflix' },
  { name: 'Inka Boxe', segment: 'Academia de boxe', logo: 'inka-boxe' },
  { name: 'Pedro Porto Studios', segment: 'Moda e portfólio', logo: 'pedro-porto' },
  { name: 'Silver Schuffner', segment: 'Joias e gemas', logo: 'silver-schuffner' },
  { name: 'JM Calçados', segment: 'Atacado de calçados', logo: 'jm-calcados' },
];

const symbol = (name: string, logo: string, height = 24): Integration => ({ name, logo, wordmark: false, height });
const wordmark = (name: string, logo: string, height: number): Integration => ({ name, logo, wordmark: true, height });

/** Empresas com que a gente já integrou, por tipo (confirmadas pelo Ian; a varredura dos repositórios achou o resto). */
export const integrations: IntegrationGroup[] = [
  {
    group: 'Pagamentos e maquininhas',
    icon: 'maquininha',
    items: [
      symbol('Stone', 'stone'),
      wordmark('PagBank', 'pagbank', 22),
      symbol('Mercado Pago', 'mercado-pago'),
      symbol('Stripe', 'stripe'),
      wordmark('Pagar.me', 'pagar-me', 30),
      wordmark('Safe2Pay', 'safe2pay', 26),
      wordmark('Asaas', 'asaas', 15),
    ],
  },
  {
    group: 'Nota fiscal e frete',
    icon: 'proposta',
    items: [wordmark('Focus NFe', 'focus-nfe', 25), wordmark('Melhor Envio', 'melhor-envio', 36)],
  },
  {
    group: 'Mensagens e avisos',
    icon: 'conversa',
    items: [symbol('WhatsApp', 'whatsapp'), wordmark('OneSignal', 'onesignal', 25), symbol('Resend', 'resend', 22)],
  },
  {
    group: 'Inteligência artificial',
    icon: 'chip',
    items: [symbol('OpenAI', 'openai'), symbol('Google Gemini', 'gemini')],
  },
];
