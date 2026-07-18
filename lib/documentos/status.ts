const DIAS_ALERTA_VENCENDO = 30;

export type DocumentoStatus = "valido" | "vencendo" | "vencido" | "pendente";

/**
 * Calcula o status de um documento a partir da data de validade.
 */
export function calcularStatus(
  dataValidade: string | null,
  semVencimento: boolean
): DocumentoStatus {
  if (semVencimento) return "valido";
  if (!dataValidade) return "pendente";

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const validade = new Date(dataValidade);

  const diasRestantes = Math.floor(
    (validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diasRestantes < 0) return "vencido";
  if (diasRestantes <= DIAS_ALERTA_VENCENDO) return "vencendo";
  return "valido";
}

export function formatarDiasLabel(
  dataValidade: string | null,
  semVencimento: boolean
): string {
  if (semVencimento) return "Documento permanente";
  if (!dataValidade) return "Aguardando validade";

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const validade = new Date(dataValidade);
  const dias = Math.floor(
    (validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (dias < 0) return `Vencido há ${Math.abs(dias)} dia(s)`;
  if (dias === 0) return "Vence hoje";
  return `Vence em ${dias} dia(s)`;
}
