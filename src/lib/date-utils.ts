/**
 * Utilitários de data/hora com timezone do Brasil (America/Sao_Paulo).
 * 
 * O servidor pode estar rodando em UTC, mas o domínio do JJCAC
 * opera no horário de Brasília. Todas as datas "hoje" devem 
 * refletir o dia correto em Recife.
 */

/**
 * Retorna a data de "hoje" no fuso de Brasília no formato YYYY-MM-DD.
 * Evita o bug de usar `new Date().toISOString().split("T")[0]` que
 * retorna UTC e pode estar um dia à frente após 21h em Recife.
 */
export function getTodayBrazil(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  }); // en-CA retorna no formato YYYY-MM-DD
}

/**
 * Converte um Date para string YYYY-MM-DD no fuso de Brasília.
 */
export function toDateStringBrazil(date: Date): string {
  return date.toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });
}
