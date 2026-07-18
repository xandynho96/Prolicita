import Link from "next/link";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { licitacoes, oportunidades, prazos } from "@/lib/db/schema";
import { getEmpresaDoUsuario } from "@/lib/empresa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarioClient } from "@/components/prazos/calendario-client";

export default async function PrazosPage() {
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

  const [listaPrazos, listaOportunidades] = await Promise.all([
    db.select().from(prazos).where(eq(prazos.empresaId, empresa.id)),
    db
      .select({ oportunidade: oportunidades, licitacao: licitacoes })
      .from(oportunidades)
      .innerJoin(licitacoes, eq(licitacoes.id, oportunidades.licitacaoId))
      .where(eq(oportunidades.empresaId, empresa.id)),
  ]);

  return (
    <CalendarioClient prazos={listaPrazos} oportunidades={listaOportunidades} />
  );
}
