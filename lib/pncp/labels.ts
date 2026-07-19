/** Tradução dos nomes de campo crus da API do PNCP para rótulos legíveis. */
export const PNCP_FIELD_LABELS: Record<string, string> = {
  numeroControlePNCP: "Número de controle PNCP",
  processo: "Processo",
  numeroCompra: "Número da compra",
  anoCompra: "Ano da compra",
  sequencialCompra: "Sequencial da compra",
  objetoCompra: "Objeto",
  informacaoComplementar: "Informação complementar",
  modalidadeId: "Código da modalidade",
  modalidadeNome: "Modalidade",
  modoDisputaId: "Código do modo de disputa",
  modoDisputaNome: "Modo de disputa",
  situacaoCompraId: "Código da situação",
  situacaoCompraNome: "Situação",
  tipoInstrumentoConvocatorioNome: "Tipo de instrumento convocatório",
  srp: "Sistema de registro de preços",
  usuarioNome: "Usuário responsável",
  orgaoSubRogadoNome: "Órgão sub-rogado",
  linkSistemaOrigem: "Link do sistema de origem",
  justificativaPresencial: "Justificativa (modo presencial)",
  valorTotalEstimado: "Valor total estimado",
  valorTotalHomologado: "Valor total homologado",
  dataInclusao: "Data de inclusão",
  dataPublicacaoPncp: "Data de publicação no PNCP",
  dataAtualizacao: "Data de atualização",
  dataAberturaProposta: "Data de abertura das propostas",
  dataEncerramentoProposta: "Data de encerramento das propostas",
};

export function labelCampoPncp(chave: string): string {
  if (PNCP_FIELD_LABELS[chave]) return PNCP_FIELD_LABELS[chave];
  // Fallback: converte camelCase em texto legível (ex.: "orgaoEntidade" -> "Orgao Entidade").
  const comEspacos = chave.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return comEspacos.charAt(0).toUpperCase() + comEspacos.slice(1);
}
