export const MODALIDADES_CONTRATACAO: Record<number, string> = {
  1: "Leilão Eletrônico",
  2: "Diálogo Competitivo",
  3: "Concurso",
  4: "Concorrência Eletrônica",
  5: "Concorrência Presencial",
  6: "Pregão Eletrônico",
  7: "Pregão Presencial",
  8: "Dispensa",
  9: "Inexigibilidade",
  10: "Manifestação de Interesse",
  11: "Pré-qualificação",
  12: "Credenciamento",
  13: "Leilão Presencial",
};

export interface PncpOrgaoEntidade {
  cnpj: string;
  razaoSocial: string;
}

export interface PncpUnidadeOrgao {
  ufSigla?: string;
  municipioNome?: string;
  codigoUnidade?: string;
}

export interface PncpContratacao {
  numeroControlePNCP: string;
  anoCompra: number;
  sequencialCompra: number;
  objetoCompra: string;
  modalidadeId?: number;
  modalidadeNome?: string;
  valorTotalEstimado?: number;
  dataPublicacaoPncp?: string;
  dataAberturaProposta?: string;
  orgaoEntidade: PncpOrgaoEntidade;
  unidadeOrgao?: PncpUnidadeOrgao;
  [key: string]: unknown;
}

export interface PncpPublicacaoResponse {
  data: PncpContratacao[];
  totalRegistros: number;
  totalPaginas: number;
  numeroPagina: number;
  paginasRestantes: number;
  empty: boolean;
}

export interface PncpArquivo {
  titulo?: string;
  uri: string;
  tipoDocumentoNome?: string;
  [key: string]: unknown;
}
