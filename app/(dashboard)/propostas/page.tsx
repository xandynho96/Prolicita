import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { licitacoes, propostas } from "@/lib/db/schema";
import { getEmpresaDoUsuario } from "@/lib/empresa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const STATUS_LABEL: Record<string, { label: string; bg: string; color: string }> = {
  rascunho: { label: "Rascunho", bg: "#FCF1DC", color: "#9A6316" },
  finalizada: { label: "Finalizada", bg: "#E3F5EC", color: "#12896B" },
};

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

      {lista.length === 0 ? (
        <div className="py-10 text-center text-[13.5px] text-muted-foreground">
          Nenhuma proposta gerada ainda. Abra uma oportunidade no{" "}
          <Link href="/oportunidades" className="font-bold text-primary hover:underline">
            Pipeline
          </Link>{" "}
          e clique em &quot;Gerar proposta&quot;.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {lista.map(({ proposta, licitacao }) => {
            const status = STATUS_LABEL[proposta.status];
            return (
              <Link
                key={proposta.id}
                href={`/propostas/${proposta.id}`}
                className="flex flex-col gap-2 rounded-[14px] border border-border bg-white p-5 shadow-sm transition-shadow hover:border-[#C9D4F5] hover:shadow-[0_6px_16px_rgba(47,95,222,0.10)]"
              >
                <div className="flex items-start justify-between gap-3.5">
                  <div className="min-w-0">
                    <div className="text-[15px] font-bold">{licitacao.objeto}</div>
                    <div className="mt-1 text-[12.5px] text-muted-foreground">
                      {licitacao.orgaoNome}
                    </div>
                  </div>
                  <span
                    className="shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-bold"
                    style={{ background: status.bg, color: status.color }}
                  >
                    {status.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
