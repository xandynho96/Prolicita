import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { licitacoes, produtosServicos, propostas } from "@/lib/db/schema";
import { getEmpresaDoUsuario } from "@/lib/empresa";
import { PropostaEditor } from "@/components/propostas/proposta-editor";

export default async function PropostaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const empresa = await getEmpresaDoUsuario(session!.user.id);
  if (!empresa) notFound();

  const [linha] = await db
    .select({ proposta: propostas, licitacao: licitacoes })
    .from(propostas)
    .innerJoin(licitacoes, eq(licitacoes.id, propostas.licitacaoId))
    .where(and(eq(propostas.id, id), eq(propostas.empresaId, empresa.id)))
    .limit(1);

  if (!linha) notFound();

  const produtosEmpresa = await db
    .select()
    .from(produtosServicos)
    .where(eq(produtosServicos.empresaId, empresa.id));

  return (
    <PropostaEditor
      proposta={linha.proposta}
      licitacao={linha.licitacao}
      produtosDisponiveis={produtosEmpresa}
    />
  );
}
