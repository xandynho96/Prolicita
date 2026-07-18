import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { oportunidades, prazos } from "@/lib/db/schema";
import { getEmpresaDoUsuario } from "@/lib/empresa";
import { prazoCreateSchema } from "@/lib/validation";
import { readJsonComLimite } from "@/lib/security/read-json";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const empresa = await getEmpresaDoUsuario(session.user.id);
  if (!empresa) {
    return NextResponse.json({ prazos: [] });
  }

  const lista = await db
    .select()
    .from(prazos)
    .where(eq(prazos.empresaId, empresa.id));

  return NextResponse.json({ prazos: lista });
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

  const parsed = prazoCreateSchema.safeParse(lido.data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    );
  }

  if (parsed.data.oportunidadeId) {
    const [oportunidade] = await db
      .select({ id: oportunidades.id })
      .from(oportunidades)
      .where(
        and(
          eq(oportunidades.id, parsed.data.oportunidadeId),
          eq(oportunidades.empresaId, empresa.id)
        )
      )
      .limit(1);

    if (!oportunidade) {
      return NextResponse.json(
        { error: "Oportunidade não encontrada" },
        { status: 404 }
      );
    }
  }

  const [prazo] = await db
    .insert(prazos)
    .values({
      empresaId: empresa.id,
      titulo: parsed.data.titulo,
      tipo: parsed.data.tipo,
      data: new Date(parsed.data.data),
      oportunidadeId: parsed.data.oportunidadeId,
      licitacaoId: parsed.data.licitacaoId,
      observacoes: parsed.data.observacoes,
    })
    .returning();

  return NextResponse.json({ prazo });
}
