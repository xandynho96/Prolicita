import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { licitacoes, produtosServicos, propostas } from "@/lib/db/schema";
import { getEmpresaDoUsuario } from "@/lib/empresa";
import { propostaCreateSchema } from "@/lib/validation";
import { readJsonComLimite } from "@/lib/security/read-json";
import { gerarProposta } from "@/lib/propostas/ai-gerar";

export const maxDuration = 60;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const empresa = await getEmpresaDoUsuario(session.user.id);
  if (!empresa) {
    return NextResponse.json({ propostas: [] });
  }

  const lista = await db
    .select({ proposta: propostas, licitacao: licitacoes })
    .from(propostas)
    .innerJoin(licitacoes, eq(licitacoes.id, propostas.licitacaoId))
    .where(eq(propostas.empresaId, empresa.id))
    .orderBy(desc(propostas.createdAt));

  return NextResponse.json({ propostas: lista });
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

  const parsed = propostaCreateSchema.safeParse(lido.data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    );
  }

  const [licitacao] = await db
    .select()
    .from(licitacoes)
    .where(eq(licitacoes.id, parsed.data.licitacaoId))
    .limit(1);

  if (!licitacao) {
    return NextResponse.json({ error: "Licitação não encontrada" }, { status: 404 });
  }

  const [existente] = await db
    .select()
    .from(propostas)
    .where(
      and(
        eq(propostas.empresaId, empresa.id),
        eq(propostas.licitacaoId, licitacao.id)
      )
    )
    .limit(1);

  if (existente) {
    return NextResponse.json({ proposta: existente });
  }

  const produtos = await db
    .select()
    .from(produtosServicos)
    .where(eq(produtosServicos.empresaId, empresa.id));

  let gerado;
  try {
    gerado = await gerarProposta({
      empresa: {
        razaoSocial: empresa.razaoSocial,
        descricaoPerfil: empresa.descricaoPerfil,
      },
      produtos,
      licitacao: {
        objeto: licitacao.objeto,
        orgaoNome: licitacao.orgaoNome,
        modalidade: licitacao.modalidade,
        valorEstimado: licitacao.valorEstimado,
      },
    });
  } catch (err) {
    console.error("Falha ao gerar proposta com IA:", err);
    return NextResponse.json(
      { error: "Falha ao gerar rascunho da proposta. Tente novamente." },
      { status: 502 }
    );
  }

  const [proposta] = await db
    .insert(propostas)
    .values({
      empresaId: empresa.id,
      licitacaoId: licitacao.id,
      status: "rascunho",
      ...gerado,
    })
    .returning();

  return NextResponse.json({ proposta });
}
