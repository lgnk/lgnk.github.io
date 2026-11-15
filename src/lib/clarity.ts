const VALID_ID = /^[a-z0-9]{6,20}$/i;

/** Carregador oficial do Microsoft Clarity para o projeto `id`. */
export function clarityTagSnippet(id: string): string {
  if (!VALID_ID.test(id)) throw new Error(`ID do Clarity inválido: ${id}`);
  return `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${id}");`;
}
