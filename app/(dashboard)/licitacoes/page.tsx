import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { empresaLicitacaoMatches, licitacoes } from "@/lib/db/schema";
import { getEmpresaDoUsuario } from "@/lib/empresa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BuscarAgoraButton } from "@/components/dashboard/buscar-button";
import { LicitacoesClient } from "@/components/licitacoes/licitacoes-client";

export default async function LicitacoesPage() {
  const session = await auth();
  const empresa = await getEmpresaDoUsuario(session!.user.id);

  if (!empresa) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Complete o perfil da sua empresa primeiro</CardTitle>
        </CardHeader>
        <CardContent>
          <Link href="/perfil">
            <Button>Preencher perfil</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const resultados = await db
    .select({ match: empresaLicitacaoMatches, licitacao: licitacoes })
    .from(empresaLicitacaoMatches)
    .innerJoin(
      licitacoes,
      eq(licitacoes.id, empresaLicitacaoMatches.licitacaoId)
    )
    .where(
      and(
        eq(empresaLicitacaoMatches.empresaId, empresa.id),
        eq(empresaLicitacaoMatches.status, "relevante")
      )
    )
    .orderBy(desc(empresaLicitacaoMatches.createdAt));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <h1 className="text-[27px] font-extrabold tracking-tight">
            Licitações
          </h1>
          <p className="mt-1.5 max-w-[620px] text-[14.5px] text-muted-foreground">
            Oportunidades encontradas pelo radar e avaliadas pela IA como
            compatíveis com o perfil da empresa.
          </p>
        </div>
        <BuscarAgoraButton />
      </div>

      <LicitacoesClient resultados={resultados} />
    </div>
  );
}
