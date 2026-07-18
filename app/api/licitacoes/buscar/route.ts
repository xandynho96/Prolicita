import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getEmpresaDoUsuario, getEscopoBusca } from "@/lib/empresa";
import { sincronizarLicitacoes } from "@/lib/pncp/sync";
import { executarMatching } from "@/lib/matching/run-matching";
import { rateLimit } from "@/lib/security/rate-limit";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const empresa = await getEmpresaDoUsuario(session.user.id);
  if (!empresa) {
    return NextResponse.json(
      { error: "Cadastre o perfil da sua empresa antes de buscar licitações" },
      { status: 400 }
    );
  }

  const limite = rateLimit(`buscar:${empresa.id}`, {
    janelaMs: 2 * 60 * 1000,
    max: 1,
  });
  if (!limite.permitido) {
    return NextResponse.json(
      {
        error: `Busca já em andamento recentemente. Aguarde ${Math.ceil(
          limite.retryAfterMs / 1000
        )}s antes de tentar novamente.`,
      },
      { status: 429 }
    );
  }

  try {
    const { ufs, modalidades } = getEscopoBusca(empresa);
    const sincronizadas = await sincronizarLicitacoes({
      diasRetroativos: 3,
      ufs,
      modalidades,
    });
    const resultado = await executarMatching({ empresaId: empresa.id });

    return NextResponse.json({ sincronizadas, ...resultado });
  } catch (err) {
    console.error("Falha ao buscar licitações:", err);
    return NextResponse.json(
      {
        error:
          "Falha ao buscar licitações. Tente novamente em instantes.",
      },
      { status: 502 }
    );
  }
}
