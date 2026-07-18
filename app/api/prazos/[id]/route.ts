import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { prazos } from "@/lib/db/schema";
import { getEmpresaDoUsuario } from "@/lib/empresa";
import { prazoUpdateSchema } from "@/lib/validation";
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

  const parsed = prazoUpdateSchema.safeParse(lido.data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    );
  }

  const { data, ...resto } = parsed.data;

  const [prazo] = await db
    .update(prazos)
    .set({ ...resto, ...(data ? { data: new Date(data) } : {}) })
    .where(and(eq(prazos.id, id), eq(prazos.empresaId, empresa.id)))
    .returning();

  if (!prazo) {
    return NextResponse.json({ error: "Prazo não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ prazo });
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
    .delete(prazos)
    .where(and(eq(prazos.id, id), eq(prazos.empresaId, empresa.id)));

  return NextResponse.json({ ok: true });
}
