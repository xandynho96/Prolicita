import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { licitacoes, notificacoes } from "@/lib/db/schema";
import { getEmpresaDoUsuario } from "@/lib/empresa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NotificacoesClient } from "@/components/notificacoes/notificacoes-client";

export default async function NotificacoesPage() {
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
    .select({ notificacao: notificacoes, licitacao: licitacoes })
    .from(notificacoes)
    .innerJoin(licitacoes, eq(licitacoes.id, notificacoes.licitacaoId))
    .where(eq(notificacoes.empresaId, empresa.id))
    .orderBy(desc(notificacoes.createdAt))
    .limit(100);

  return <NotificacoesClient notificacoes={resultados} />;
}
