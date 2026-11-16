import type { PixelIcon } from '../lib/icons';

export interface Client {
  name: string;
  segment: string;
}

export interface IntegrationGroup {
  group: string;
  icon: PixelIcon;
  names: string[];
}

/** Quem já contou com a gente. O Avance Trainer é produto próprio, por isso não entra aqui. */
export const clients: Client[] = [
  { name: 'Beerpass Club', segment: 'Autoatendimento de chope' },
  { name: 'InkaBoxe', segment: 'Academia de boxe' },
  { name: 'Pedro Porto Studios', segment: 'Moda e portfólio' },
  { name: 'Silver Schuffner', segment: 'Joias e gemas' },
  { name: 'JM Calçados', segment: 'Atacado de calçados' },
];

/** Empresas com que a gente já integrou, por tipo (confirmadas pelo Ian). */
export const integrations: IntegrationGroup[] = [
  {
    group: 'Pagamentos e maquininhas',
    icon: 'maquininha',
    names: ['Stone', 'PagBank', 'Mercado Pago', 'Stripe', 'Pagar.me', 'Safe2Pay'],
  },
];
