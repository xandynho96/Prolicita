import { licitacoes, empresas, produtosServicos } from "@/lib/db/schema";

type Empresa = typeof empresas.$inferSelect;
type Licitacao = typeof licitacoes.$inferSelect;
type Produto = typeof produtosServicos.$inferSelect;

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

const STOPWORDS = new Set([
  "para",
  "com",
  "dos",
  "das",
  "que",
  "uma",
  "por",
  "sao",
  "sua",
  "seu",
  "nos",
  "nas",
  "este",
  "esta",
  "empresa",
  "servicos",
  "produtos",
]);

function extrairTermos(descricao: string): string[] {
  return normalizar(descricao)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 3 && !STOPWORDS.has(t));
}

/**
 * Regiões que a empresa quer monitorar. `null` significa sem restrição
 * (Brasil todo). Se a empresa não configurou região de busca, cai de volta
 * para a UF do endereço dela (comportamento anterior).
 */
function ufsDeInteresse(empresa: Empresa): string[] | null {
  if (empresa.buscarBrasilTodo) return null;
  if (empresa.ufsBusca.length > 0) return empresa.ufsBusca;
  if (empresa.uf) return [empresa.uf];
  return null;
}

/**
 * Pré-filtro barato (sem IA): decide se uma licitação merece ser avaliada
 * pela IA para uma empresa, com base em região, modalidade e interseção de
 * termos. A faixa de valor NÃO é usada aqui para descartar — vira contexto
 * passado à IA (ver `avaliarMatchIA`), porque um corte automático por valor
 * descarta oportunidades reais (ex.: implantação de um único módulo em
 * município pequeno) antes de a IA sequer avaliar o objeto.
 */
export function passaFiltroPreliminar(
  empresa: Empresa,
  licitacao: Licitacao,
  produtos: Produto[] = []
): boolean {
  const ufs = ufsDeInteresse(empresa);
  if (ufs && licitacao.uf && !ufs.includes(licitacao.uf)) {
    return false;
  }

  if (
    empresa.modalidades.length > 0 &&
    licitacao.modalidadeId != null &&
    !empresa.modalidades.includes(licitacao.modalidadeId)
  ) {
    return false;
  }

  const termos = new Set([
    ...empresa.palavrasChave.map((p) => normalizar(p)),
    ...(empresa.descricaoPerfil ? extrairTermos(empresa.descricaoPerfil) : []),
    ...produtos.flatMap((p) => [
      ...extrairTermos(p.nome),
      ...extrairTermos(p.descricaoResumida),
    ]),
  ]);

  if (termos.size === 0) {
    // Sem termos cadastrados, não há como pré-filtrar — deixa passar
    // para a empresa configurar melhor o perfil depois.
    return true;
  }

  const objeto = normalizar(licitacao.objeto);
  return [...termos].some((termo) => termo.length > 2 && objeto.includes(termo));
}
