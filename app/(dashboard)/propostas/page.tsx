import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { licitacoes, propostas } from "@/lib/db/schema";
import { getEmpresaDoUsuario } from "@/lib/empresa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PropostasList } from "@/components/propostas/propostas-list";

export default async function PropostasPage() {
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

  const lista = await db
    .select({ proposta: propostas, licitacao: licitacoes })
    .from(propostas)
    .innerJoin(licitacoes, eq(licitacoes.id, propostas.licitacaoId))
    .where(eq(propostas.empresaId, empresa.id))
    .orderBy(desc(propostas.createdAt));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[27px] font-extrabold tracking-tight">Propostas</h1>
        <p className="mt-1.5 max-w-[620px] text-[14.5px] text-muted-foreground">
          Rascunhos de proposta gerados por IA para as licitações no seu
          pipeline. Gere uma nova a partir de uma oportunidade.
        </p>
      </div>

      <PropostasList itens={lista} />
    </div>
  );
}
