import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { empresas, licitacoes, oportunidades, prazos } from "@/lib/db/schema";

/**
 * Cria a oportunidade no pipeline para uma licitação recém-avaliada como
 * relevante (se ainda não existir) e, quando a licitação tiver data de
 * abertura de propostas, cria automaticamente o prazo de sessão vinculado.
 */
export async function criarOportunidadeAutomatica(
  empresa: typeof empresas.$inferSelect,
  licitacao: typeof licitacoes.$inferSelect
): Promise<void> {
  const [oportunidade] = await db
    .insert(oportunidades)
    .values({
      empresaId: empresa.id,
      licitacaoId: licitacao.id,
      etapa: "identificada",
    })
    .onConflictDoNothing({
      target: [oportunidades.empresaId, oportunidades.licitacaoId],
    })
    .returning();

  if (!oportunidade || !licitacao.dataAberturaProposta) return;

  const [prazoExistente] = await db
    .select({ id: prazos.id })
    .from(prazos)
    .where(
      and(
        eq(prazos.oportunidadeId, oportunidade.id),
        eq(prazos.tipo, "sessao")
      )
    )
    .limit(1);

  if (prazoExistente) return;

  await db.insert(prazos).values({
    empresaId: empresa.id,
    oportunidadeId: oportunidade.id,
    licitacaoId: licitacao.id,
    titulo: "Sessão/abertura de propostas",
    tipo: "sessao",
    data: licitacao.dataAberturaProposta,
  });
}
