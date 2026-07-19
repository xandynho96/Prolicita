import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { produtosServicos } from "@/lib/db/schema";
import { getEmpresaDoUsuario } from "@/lib/empresa";
import { produtoCreateSchema } from "@/lib/validation";
import { readJsonComLimite } from "@/lib/security/read-json";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const empresa = await getEmpresaDoUsuario(session.user.id);
  if (!empresa) {
    return NextResponse.json({ produtos: [] });
  }

  const lista = await db
    .select()
    .from(produtosServicos)
    .where(eq(produtosServicos.empresaId, empresa.id))
    .orderBy(desc(produtosServicos.createdAt));

  return NextResponse.json({ produtos: lista });
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

  const parsed = produtoCreateSchema.safeParse(lido.data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    );
  }

  const [produto] = await db
    .insert(produtosServicos)
    .values({ empresaId: empresa.id, ...parsed.data })
    .returning();

  return NextResponse.json({ produto });
}
