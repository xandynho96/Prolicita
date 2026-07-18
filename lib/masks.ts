export function maskCnpj(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function maskCep(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/^(\d{5})(\d)/, "$1-$2");
}

/** Telefone brasileiro com DDD, sem código do país: (11) 99999-9999 */
export function maskTelefone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) {
    return d
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return d
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

/** Máscara de valor monetário (sem centavos): 500000 -> 500.000 */
export function maskMoeda(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("pt-BR");
}

/** Converte um número/string vindo do banco (ex.: "500000.00") para o
 * formato de exibição do input mascarado (ex.: "500.000"). */
export function numeroParaMascaraMoeda(
  value: string | number | null | undefined
): string {
  if (value === null || value === undefined || value === "") return "";
  const num = Math.round(Number(value));
  if (Number.isNaN(num)) return "";
  return num.toLocaleString("pt-BR");
}

/** Número de WhatsApp com código do país: +55 (11) 99999-9999 */
export function maskWhatsapp(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 13);
  if (d.length === 0) return "";
  if (d.length <= 2) return `+${d}`;
  if (d.length <= 4) return `+${d.slice(0, 2)} (${d.slice(2)}`;
  if (d.length <= 8) return `+${d.slice(0, 2)} (${d.slice(2, 4)}) ${d.slice(4)}`;
  return `+${d.slice(0, 2)} (${d.slice(2, 4)}) ${d.slice(4, d.length - 4)}-${d.slice(-4)}`;
}
