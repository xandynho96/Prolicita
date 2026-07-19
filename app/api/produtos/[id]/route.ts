import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { produtosServicos } from "@/lib/db/schema";
import { getEmpresaDoUsuario } from "@/lib/empresa";
import { produtoUpdateSchema } from "@/lib/validation";
import { readJsonComLimite } from "@/lib/security/read-json";

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

  const parsed = produtoUpdateSchema.safeParse(lido.data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    );
  }

  const [produto] = await db
    .update(produtosServicos)
    .set(parsed.data)
    .where(
      and(
        eq(produtosServicos.id, id),
        eq(produtosServicos.empresaId, empresa.id)
      )
    )
    .returning();

  if (!produto) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ produto });
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
    .delete(produtosServicos)
    .where(
      and(
        eq(produtosServicos.id, id),
        eq(produtosServicos.empresaId, empresa.id)
      )
    );

  return NextResponse.json({ ok: true });
}
