import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { licitacoes, propostas } from "@/lib/db/schema";
import { getEmpresaDoUsuario } from "@/lib/empresa";
import { propostaUpdateSchema } from "@/lib/validation";
import { readJsonComLimite } from "@/lib/security/read-json";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const empresa = await getEmpresaDoUsuario(session.user.id);
  if (!empresa) {
    return NextResponse.json({ error: "Empresa não encontrada" }, { status: 400 });
  }

  const [linha] = await db
    .select({ proposta: propostas, licitacao: licitacoes })
    .from(propostas)
    .innerJoin(licitacoes, eq(licitacoes.id, propostas.licitacaoId))
    .where(and(eq(propostas.id, id), eq(propostas.empresaId, empresa.id)))
    .limit(1);

  if (!linha) {
    return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });
  }

  return NextResponse.json(linha);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const parsed = propostaUpdateSchema.safeParse(lido.data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    );
  }

  const [proposta] = await db
    .update(propostas)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(propostas.id, id), eq(propostas.empresaId, empresa.id)))
    .returning();

  if (!proposta) {
    return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ proposta });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const empresa = await getEmpresaDoUsuario(session.user.id);
  if (!empresa) {
    return NextResponse.json({ error: "Empresa não encontrada" }, { status: 400 });
  }

  await db
    .delete(propostas)
    .where(and(eq(propostas.id, id), eq(propostas.empresaId, empresa.id)));

  return NextResponse.json({ ok: true });
}
