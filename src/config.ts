/** Todos os dados de negócio do site. Trocar um valor aqui troca em todo lugar. */

export const PLACEHOLDER_WHATSAPP = '5500000000000';

export interface SiteConfig {
  name: string;
  legalName: string;
  cnpj: string;
  city: string;
  url: string;
  email: { address: string; ready: boolean };
  instagram: string | null;
  whatsapp: { number: string; message: string };
  clarityId: string;
  sitePriceFrom: string;
}

export const site: SiteConfig = {
  name: 'LGNK Sistemas',
  legalName: 'Langkammer Sistemas LTDA',
  cnpj: '50.326.062/0001-66',
  city: 'Belo Horizonte, MG',
  url: 'https://lgnk.com.br',
  // Marque ready: true quando contato@ estiver chegando no Gmail.
  email: { address: 'contato@lgnk.com.br', ready: false },
  instagram: null,
  // Só dígitos: 55 + DDD + número. O build de produção recusa o número fictício.
  whatsapp: { number: '5533988429751', message: 'Olá! Vim pelo site da LGNK.' },
  // ID do projeto no Microsoft Clarity. Vazio = analytics desligado.
  clarityId: '',
  sitePriceFrom: 'R$ 2.000',
};
