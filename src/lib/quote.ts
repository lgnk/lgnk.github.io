/** Montador de orçamento: transforma as escolhas do visitante na mensagem que ele manda no WhatsApp. */
import { whatsappUrl } from './whatsapp';

export const QUOTE_OPTIONS = {
  need: ['Sistema sob medida', 'App ou integração', 'Site ou loja virtual', 'Manutenção', 'Ainda não sei'],
  pains: ['Perco venda ou pedido', 'Atendimento demora', 'Tudo no papel ou planilha', 'Cobrança e pagamento', 'Outra coisa'],
  when: ['Quanto antes', 'Este mês', 'Nos próximos meses', 'Só pesquisando'],
} as const;

export interface QuoteChoices {
  need?: string;
  pains: string[];
  business?: string;
  when?: string;
}

const GREETING = 'Olá! Vim pelo site da LGNK e quero um orçamento.';
const BUSINESS_MAX = 80;

/** Roteiro em branco, para quem abre o WhatsApp sem o montador (sem JavaScript). */
export const QUOTE_TEMPLATE = `${GREETING}\n• Preciso de: \n• Meu negócio: \n• O que mais atrapalha: \n• Prazo: `;

export function quoteMessage(c: QuoteChoices): string {
  const business = (c.business ?? '').trim().slice(0, BUSINESS_MAX);
  const lines = [GREETING];
  if (c.need) lines.push(`• Preciso de: ${c.need}`);
  if (business) lines.push(`• Meu negócio: ${business}`);
  if (c.pains.length) lines.push(`• O que mais atrapalha: ${c.pains.join(', ')}`);
  if (c.when) lines.push(`• Prazo: ${c.when}`);
  return lines.join('\n');
}

export function quoteUrl(number: string, c: QuoteChoices): string {
  return whatsappUrl(number, quoteMessage(c));
}
