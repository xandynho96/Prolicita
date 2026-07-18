export const ETAPAS = [
  "identificada",
  "em_analise",
  "proposta_enviada",
  "aguardando_resultado",
  "ganha",
  "perdida",
] as const;

export type Etapa = (typeof ETAPAS)[number];

export const ETAPA_META: Record<Etapa, { label: string; color: string }> = {
  identificada: { label: "Identificada", color: "#565F6B" },
  em_analise: { label: "Em análise", color: "#9A6316" },
  proposta_enviada: { label: "Proposta enviada", color: "#2F5FDE" },
  aguardando_resultado: { label: "Aguardando resultado", color: "#7C5CFC" },
  ganha: { label: "Ganha", color: "#12896B" },
  perdida: { label: "Perdida", color: "#B23A3A" },
};

export const PRAZO_TIPOS = [
  "sessao",
  "impugnacao",
  "recurso",
  "entrega_documentos",
  "outro",
] as const;

export type PrazoTipo = (typeof PRAZO_TIPOS)[number];

export const PRAZO_TIPO_META: Record<PrazoTipo, { label: string; color: string }> = {
  sessao: { label: "Sessão/abertura", color: "#2F5FDE" },
  impugnacao: { label: "Impugnação/esclarecimento", color: "#9A6316" },
  recurso: { label: "Recurso", color: "#B23A3A" },
  entrega_documentos: { label: "Entrega de documentos", color: "#7C5CFC" },
  outro: { label: "Outro", color: "#565F6B" },
};
