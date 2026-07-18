import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { licitacoes } from "@/lib/db/schema";
import {
  buscarArquivosContratacao,
  buscarContratacoesPublicadas,
  montarLinkPortal,
} from "./client";
import { PncpContratacao } from "./types";

function detectarLinkEdital(
  arquivos: Awaited<ReturnType<typeof buscarArquivosContratacao>>
): string | undefined {
  const edital = arquivos.find((a) =>
    (a.tipoDocumentoNome ?? a.titulo ?? "").toLowerCase().includes("edital")
  );
  return edital?.uri ?? arquivos[0]?.uri;
}

async function upsertContratacao(item: PncpContratacao) {
  const cnpjOrgao = item.orgaoEntidade?.cnpj;
  if (!cnpjOrgao) return;

  const linkPortal = montarLinkPortal(
    cnpjOrgao,
    item.anoCompra,
    item.sequencialCompra
  );

  await db
    .insert(licitacoes)
    .values({
      pncpId: item.numeroControlePNCP,
      orgaoNome: item.orgaoEntidade.razaoSocial,
      orgaoCnpj: cnpjOrgao,
      objeto: item.objetoCompra,
      modalidade: item.modalidadeNome,
      modalidadeId: item.modalidadeId ?? null,
      uf: item.unidadeOrgao?.ufSigla,
      municipio: item.unidadeOrgao?.municipioNome,
      valorEstimado:
        item.valorTotalEstimado != null
          ? String(item.valorTotalEstimado)
          : null,
      dataPublicacao: item.dataPublicacaoPncp
        ? item.dataPublicacaoPncp.slice(0, 10)
        : null,
      dataAberturaProposta: item.dataAberturaProposta
        ? new Date(item.dataAberturaProposta)
        : null,
      linkPortal,
      rawJson: item,
    })
    .onConflictDoUpdate({
      target: licitacoes.pncpId,
      set: {
        objeto: item.objetoCompra,
        dataAberturaProposta: item.dataAberturaProposta
          ? new Date(item.dataAberturaProposta)
          : null,
        rawJson: item,
      },
    });
}

/**
 * Busca contratações recém-publicadas no PNCP e sincroniza com o banco local.
 * Não busca o link do edital aqui — isso é feito sob demanda (via
 * `garantirLinkEdital`) apenas para licitações relevantes, para não estourar
 * o rate limit do PNCP consultando arquivos de todas as contratações do país.
 * Retorna quantas licitações foram processadas.
 */
export async function sincronizarLicitacoes(options?: {
  diasRetroativos?: number;
  ufs?: string[];
  modalidades?: number[];
}): Promise<number> {
  const contratacoes = await buscarContratacoesPublicadas(options);

  for (const item of contratacoes) {
    try {
      await upsertContratacao(item);
    } catch (err) {
      console.error(
        `Falha ao sincronizar contratação ${item.numeroControlePNCP}:`,
        err
      );
    }
  }

  return contratacoes.length;
}

/**
 * Busca (sob demanda) e persiste o link do edital de uma licitação já
 * salva no banco, caso ainda não tenha sido descoberto.
 */
export async function garantirLinkEdital(
  licitacao: typeof licitacoes.$inferSelect
): Promise<string | undefined> {
  if (licitacao.linkEdital) return licitacao.linkEdital;

  const raw = licitacao.rawJson as PncpContratacao | null;
  const anoCompra = raw?.anoCompra;
  const sequencialCompra = raw?.sequencialCompra;
  if (!anoCompra || !sequencialCompra) return undefined;

  const arquivos = await buscarArquivosContratacao(
    licitacao.orgaoCnpj,
    anoCompra,
    sequencialCompra
  );
  const linkEdital = detectarLinkEdital(arquivos);
  if (!linkEdital) return undefined;

  await db
    .update(licitacoes)
    .set({ linkEdital })
    .where(eq(licitacoes.id, licitacao.id));

  return linkEdital;
}
