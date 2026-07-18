export function formatarValor(valor: string | null): string {
  if (!valor) return "não informado";
  const num = Number(valor);
  if (Number.isNaN(num)) return "não informado";
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Converte um valor de <input type="date"> ("AAAA-MM-DD") para ISO string,
 * fixando o horário ao meio-dia UTC para evitar que a data exibida mude de
 * dia dependendo do fuso horário do navegador/servidor.
 */
export function dataInputParaIso(dataInput: string): string {
  return new Date(`${dataInput}T12:00:00Z`).toISOString();
}

/**
 * Converte uma data/ISO string (salva ao meio-dia UTC) de volta para o
 * formato "AAAA-MM-DD" esperado por <input type="date">, usando os
 * componentes UTC para não sofrer o deslocamento de fuso horário.
 */
export function dataParaInput(data: Date | string): string {
  const d = new Date(data);
  const ano = d.getUTCFullYear();
  const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(d.getUTCDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

/**
 * Formata uma data/ISO string (salva ao meio-dia UTC) como dd/mm/aaaa,
 * usando os componentes UTC para não sofrer o deslocamento de fuso horário.
 */
export function formatarDataUtc(data: Date | string): string {
  const d = new Date(data);
  const dia = String(d.getUTCDate()).padStart(2, "0");
  const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
  const ano = d.getUTCFullYear();
  return `${dia}/${mes}/${ano}`;
}
