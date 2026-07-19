import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { buscarCnpj } from "@/lib/cnpj/brasilapi";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ cnpj: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { cnpj } = await params;
  const digitos = cnpj.replace(/\D/g, "");
  if (digitos.length !== 14) {
    return NextResponse.json({ error: "CNPJ inválido" }, { status: 400 });
  }

  try {
    const dados = await buscarCnpj(digitos);
    if (!dados) {
      return NextResponse.json(
        { error: "CNPJ não encontrado" },
        { status: 404 }
      );
    }
    return NextResponse.json({ dados });
  } catch {
    return NextResponse.json(
      { error: "Falha ao consultar CNPJ" },
      { status: 502 }
    );
  }
}
