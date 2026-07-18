import { NextResponse } from "next/server";
import { and, desc, eq, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { empresaLicitacaoMatches, licitacoes, oportunidades } from "@/lib/db/schema";
import { getEmpresaDoUsuario } from "@/lib/empresa";
import { oportunidadeCreateSchema } from "@/lib/validation";
import { readJsonComLimite } from "@/lib/security/read-json";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const empresa = await getEmpresaDoUsuario(session.user.id);
  if (!empresa) {
    return NextResponse.json({ oportunidades: [], disponiveis: [] });
  }

  const [lista, disponiveis] = await Promise.all([
    db
      .select({ oportunidade: oportunidades, licitacao: licitacoes })
      .from(oportunidades)
      .innerJoin(licitacoes, eq(licitacoes.id, oportunidades.licitacaoId))
      .where(eq(oportunidades.empresaId, empresa.id))
      .orderBy(desc(oportunidades.updatedAt)),
    db
      .select({ licitacao: licitacoes })
      .from(empresaLicitacaoMatches)
      .innerJoin(licitacoes, eq(licitacoes.id, empresaLicitacaoMatches.licitacaoId))
      .leftJoin(
        oportunidades,
        and(
          eq(oportunidades.licitacaoId, empresaLicitacaoMatches.licitacaoId),
          eq(oportunidades.empresaId, empresa.id)
        )
      )
      .where(
        and(
          eq(empresaLicitacaoMatches.empresaId, empresa.id),
          eq(empresaLicitacaoMatches.status, "relevante"),
          isNull(oportunidades.id)
        )
      )
      .orderBy(desc(empresaLicitacaoMatches.createdAt)),
  ]);

  return NextResponse.json({
    oportunidades: lista,
    disponiveis: disponiveis.map((d) => d.licitacao),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const empresa = await getEmpresaDoUsuario(session.user.id);
  if (!empresa) {
    return NextResponse.json({ error: "Empresa não encontrada" }, { status: 400 });
  }

  const lido = await readJsonComLimite(req);
  if (!lido.ok) {
    return NextResponse.json({ error: lido.error }, { status: lido.status });
  }

  const parsed = oportunidadeCreateSchema.safeParse(lido.data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    );
  }

  const [oportunidade] = await db
    .insert(oportunidades)
    .values({
      empresaId: empresa.id,
      licitacaoId: parsed.data.licitacaoId,
      etapa: "identificada",
    })
    .onConflictDoNothing({
      target: [oportunidades.empresaId, oportunidades.licitacaoId],
    })
    .returning();

  return NextResponse.json({ oportunidade });
}
