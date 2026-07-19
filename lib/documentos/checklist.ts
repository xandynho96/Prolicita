export interface ChecklistItem {
  id: string;
  grupo: "juridico" | "fiscal" | "economico" | "tecnico" | "declaracoes";
  nome: string;
  baseLegal: string;
}

/**
 * Catálogo fixo dos documentos de habilitação previstos na Lei 14.133/21
 * (Arts. 62-70). É um ponto de partida — o edital de cada órgão pode exigir
 * documentos adicionais ou dispensar algum destes.
 */
export const CHECKLIST_HABILITACAO: ChecklistItem[] = [
  {
    id: "ato_constitutivo",
    grupo: "juridico",
    nome: "Ato constitutivo, estatuto ou contrato social",
    baseLegal: "Art. 66, I",
  },
  {
    id: "prova_cnpj",
    grupo: "juridico",
    nome: "Prova de inscrição no CNPJ",
    baseLegal: "Art. 68",
  },
  {
    id: "cnd_federal",
    grupo: "fiscal",
    nome: "Certidão de regularidade com a Fazenda Federal e Dívida Ativa da União",
    baseLegal: "Art. 68, II",
  },
  {
    id: "cnd_estadual",
    grupo: "fiscal",
    nome: "Certidão de regularidade com a Fazenda Estadual",
    baseLegal: "Art. 68, II",
  },
  {
    id: "cnd_municipal",
    grupo: "fiscal",
    nome: "Certidão de regularidade com a Fazenda Municipal",
    baseLegal: "Art. 68, II",
  },
  {
    id: "crf_fgts",
    grupo: "fiscal",
    nome: "Certificado de Regularidade do FGTS (CRF)",
    baseLegal: "Art. 68, IV",
  },
  {
    id: "cndt",
    grupo: "fiscal",
    nome: "Certidão Negativa de Débitos Trabalhistas (CNDT)",
    baseLegal: "Art. 68, V",
  },
  {
    id: "balanco_patrimonial",
    grupo: "economico",
    nome: "Balanço patrimonial e demonstrações contábeis",
    baseLegal: "Art. 69, I",
  },
  {
    id: "certidao_falencia",
    grupo: "economico",
    nome: "Certidão negativa de falência ou recuperação judicial",
    baseLegal: "Art. 69, II",
  },
  {
    id: "atestado_capacidade_tecnica",
    grupo: "tecnico",
    nome: "Atestado(s) de capacidade técnica",
    baseLegal: "Art. 67, I",
  },
  {
    id: "registro_conselho",
    grupo: "tecnico",
    nome: "Registro/inscrição em entidade profissional (quando exigido)",
    baseLegal: "Art. 67, II",
  },
  {
    id: "declaracao_menor",
    grupo: "declaracoes",
    nome: "Declaração de cumprimento do art. 7º, XXXIII da CF (não emprega menor)",
    baseLegal: "Art. 68, VI",
  },
  {
    id: "declaracao_fatos_impeditivos",
    grupo: "declaracoes",
    nome: "Declaração de inexistência de fato impeditivo à habilitação",
    baseLegal: "Art. 68, caput",
  },
];

export const CHECKLIST_GRUPO_META: Record<
  ChecklistItem["grupo"],
  { label: string }
> = {
  juridico: { label: "Habilitação jurídica" },
  fiscal: { label: "Regularidade fiscal e trabalhista" },
  economico: { label: "Qualificação econômico-financeira" },
  tecnico: { label: "Qualificação técnica" },
  declaracoes: { label: "Declarações" },
};

export function buscarChecklistItem(id: string | null): ChecklistItem | null {
  if (!id) return null;
  return CHECKLIST_HABILITACAO.find((item) => item.id === id) ?? null;
}
