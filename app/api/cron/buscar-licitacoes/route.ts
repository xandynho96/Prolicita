import { NextResponse } from "next/server";
import { sincronizarLicitacoes } from "@/lib/pncp/sync";
import { executarMatching } from "@/lib/matching/run-matching";

export const maxDuration = 300;

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const sincronizadas = await sincronizarLicitacoes({ diasRetroativos: 2 });
    const resultado = await executarMatching();

    return NextResponse.json({ sincronizadas, ...resultado });
  } catch (err) {
    console.error("Falha no cron de busca de licitações:", err);
    return NextResponse.json(
      { error: "Falha na execução do cron" },
      { status: 500 }
    );
  }
}
