import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { oportunidades } from "@/lib/db/schema";
import { getEmpresaDoUsuario } from "@/lib/empresa";
import { oportunidadeUpdateSchema } from "@/lib/validation";
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

  const parsed = oportunidadeUpdateSchema.safeParse(lido.data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    );
  }

  const [oportunidade] = await db
    .update(oportunidades)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(oportunidades.id, id), eq(oportunidades.empresaId, empresa.id)))
    .returning();

  if (!oportunidade) {
    return NextResponse.json(
      { error: "Oportunidade não encontrada" },
      { status: 404 }
    );
  }

  return NextResponse.json({ oportunidade });
}
