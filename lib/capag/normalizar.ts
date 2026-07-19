/** Normaliza nome de município para casar dados do PNCP com o dataset do
 * Tesouro Nacional (acentos, apóstrofos e hífens variam entre as fontes). */
export function normalizarMunicipio(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
