import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { empresas } from "@/lib/db/schema";
import { empresaSchema } from "@/lib/validation";
import { getEmpresaDoUsuario } from "@/lib/empresa";
import { readJsonComLimite } from "@/lib/security/read-json";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const empresa = await getEmpresaDoUsuario(session.user.id);
  return NextResponse.json({ empresa });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const lido = await readJsonComLimite(req);
  if (!lido.ok) {
    return NextResponse.json({ error: lido.error }, { status: lido.status });
  }

  const parsed = empresaSchema.safeParse(lido.data);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    );
  }

  const existente = await getEmpresaDoUsuario(session.user.id);

  if (existente) {
    const [empresa] = await db
      .update(empresas)
      .set(parsed.data)
      .where(eq(empresas.id, existente.id))
      .returning();
    return NextResponse.json({ empresa });
  }

  const [empresa] = await db
    .insert(empresas)
    .values({ ...parsed.data, userId: session.user.id })
    .returning();

  return NextResponse.json({ empresa });
}
