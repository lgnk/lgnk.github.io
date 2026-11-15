const VALID_NUMBER = /^\d{12,13}$/;

export function whatsappUrl(number: string, message: string): string {
  if (!VALID_NUMBER.test(number)) {
    throw new Error(`Número de WhatsApp inválido: ${number}`);
  }
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
