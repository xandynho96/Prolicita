export const CATEGORIA_META: Record<
  string,
  { label: string; color: string; initials: string }
> = {
  juridico: { label: "Jurídico", color: "#445FCE", initials: "JU" },
  fiscal: { label: "Fiscal", color: "#0C7A88", initials: "FI" },
  tecnico: { label: "Técnico", color: "#B45A1E", initials: "TE" },
  economico: { label: "Econômico-financeiro", color: "#3D8B5F", initials: "EC" },
  declaracoes: { label: "Declarações", color: "#6B4CE0", initials: "DE" },
  propostas: { label: "Propostas", color: "#8A7415", initials: "PR" },
  editais: { label: "Editais", color: "#55606E", initials: "ED" },
};

export const STATUS_META: Record<
  string,
  { label: string; bg: string; color: string }
> = {
  valido: { label: "Válido", bg: "#E3F5EC", color: "#12896B" },
  vencendo: { label: "Vencendo", bg: "#FCF1DC", color: "#9A6316" },
  vencido: { label: "Vencido", bg: "#FBE7E7", color: "#B23A3A" },
  pendente: { label: "Pendente revisão", bg: "#EEF0F3", color: "#565F6B" },
};
