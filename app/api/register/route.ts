import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { cadastroSchema } from "@/lib/validation";
import { readJsonComLimite } from "@/lib/security/read-json";
import { ipDaRequisicao, rateLimit } from "@/lib/security/rate-limit";

export async function POST(req: Request) {
  const limite = rateLimit(`register:${ipDaRequisicao(req)}`, {
    janelaMs: 60 * 60 * 1000,
    max: 10,
  });
  if (!limite.permitido) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente mais tarde." },
      { status: 429 }
    );
  }

  const lido = await readJsonComLimite(req);
  if (!lido.ok) {
    return NextResponse.json({ error: lido.error }, { status: lido.status });
  }

  const parsed = cadastroSchema.safeParse(lido.data);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existing) {
    return NextResponse.json(
      { error: "Já existe uma conta com este email" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [user] = await db
    .insert(users)
    .values({ name, email: normalizedEmail, passwordHash })
    .returning({ id: users.id, email: users.email });

  return NextResponse.json({ user });
}
