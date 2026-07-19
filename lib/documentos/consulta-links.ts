/**
 * Links diretos para consultar/emitir certidões de regularidade nos portais
 * oficiais. Não é possível preencher o CNPJ automaticamente nem pular o
 * CAPTCHA desses portais — isso só evita o passo de "achar o site certo".
 */
export function linkConsultaCertidao(
  checklistItemId: string,
  uf: string | null
): string | null {
  switch (checklistItemId) {
    case "cnd_federal":
      return "https://servicos.receita.fazenda.gov.br/servicos/certidao/";
    case "crf_fgts":
      return "https://consulta-crf.caixa.gov.br/";
    case "cndt":
      return "https://cndt-certidao.tst.jus.br/gerarCertidao.faces";
    case "cnd_estadual":
      return `https://www.google.com/search?q=${encodeURIComponent(
        `certidão negativa de débitos SEFAZ${uf ? ` ${uf}` : ""}`
      )}`;
    default:
      return null;
  }
}
