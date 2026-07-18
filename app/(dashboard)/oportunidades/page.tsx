import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  empresaLicitacaoMatches,
  licitacoes,
  oportunidades,
  prazos,
} from "@/lib/db/schema";
import { getEmpresaDoUsuario } from "@/lib/empresa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/components/oportunidades/kanban-board";
import { isNull } from "drizzle-orm";

export default async function OportunidadesPage() {
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

  const [lista, disponiveisRaw, prazosLista] = await Promise.all([
    db
      .select({
        oportunidade: oportunidades,
        licitacao: licitacoes,
        match: empresaLicitacaoMatches,
      })
      .from(oportunidades)
      .innerJoin(licitacoes, eq(licitacoes.id, oportunidades.licitacaoId))
      .leftJoin(
        empresaLicitacaoMatches,
        and(
          eq(empresaLicitacaoMatches.licitacaoId, oportunidades.licitacaoId),
          eq(empresaLicitacaoMatches.empresaId, oportunidades.empresaId)
        )
      )
      .where(eq(oportunidades.empresaId, empresa.id)),
    db
      .select({ licitacao: licitacoes })
      .from(empresaLicitacaoMatches)
      .innerJoin(licitacoes, eq(licitacoes.id, empresaLicitacaoMatches.licitacaoId))
      .leftJoin(
        oportunidades,
        and(
          eq(oportunidades.licitacaoId, empresaLicitacaoMatches.licitacaoId),
          eq(oportunidades.empresaId, empresa.id)
        )
      )
      .where(
        and(
          eq(empresaLicitacaoMatches.empresaId, empresa.id),
          eq(empresaLicitacaoMatches.status, "relevante"),
          isNull(oportunidades.id)
        )
      ),
    db.select().from(prazos).where(eq(prazos.empresaId, empresa.id)),
  ]);

  return (
    <KanbanBoard
      oportunidades={lista}
      disponiveis={disponiveisRaw.map((d) => d.licitacao)}
      prazos={prazosLista}
    />
  );
}
