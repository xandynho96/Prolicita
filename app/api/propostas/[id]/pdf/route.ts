import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { renderToBuffer } from "@react-pdf/renderer";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { licitacoes, produtosServicos, propostas } from "@/lib/db/schema";
import { getEmpresaDoUsuario } from "@/lib/empresa";
import { PropostaDocument } from "@/lib/propostas/pdf-template";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const empresa = await getEmpresaDoUsuario(session.user.id);
  if (!empresa) {
    return NextResponse.json({ error: "Empresa não encontrada" }, { status: 400 });
  }

  const [linha] = await db
    .select({ proposta: propostas, licitacao: licitacoes })
    .from(propostas)
    .innerJoin(licitacoes, eq(licitacoes.id, propostas.licitacaoId))
    .where(and(eq(propostas.id, id), eq(propostas.empresaId, empresa.id)))
    .limit(1);

  if (!linha) {
    return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });
  }

  const { proposta, licitacao } = linha;

  const produtosSelecionados =
    proposta.produtosSelecionadosIds.length > 0
      ? await db
          .select()
          .from(produtosServicos)
          .where(inArray(produtosServicos.id, proposta.produtosSelecionadosIds))
      : [];

  const enderecoCompleto = [
    empresa.logradouro,
    empresa.numero,
    empresa.bairro,
    empresa.municipio,
    empresa.uf,
  ]
    .filter(Boolean)
    .join(", ");

  const buffer = await renderToBuffer(
    PropostaDocument({
      data: {
        razaoSocial: empresa.razaoSocial,
        cnpj: empresa.cnpj,
        enderecoCompleto,
        representanteLegalNome: empresa.representanteLegalNome,
        representanteLegalCpf: empresa.representanteLegalCpf,
        representanteLegalCargo: empresa.representanteLegalCargo,
        orgaoNome: licitacao.orgaoNome,
        objetoLicitacao: licitacao.objeto,
        modalidade: licitacao.modalidade,
        pncpId: licitacao.pncpId,
        produtosSelecionados: produtosSelecionados.map((p) => ({
          nome: p.nome,
          descricaoResumida: p.descricaoResumida,
        })),
        apresentacaoEmpresa: proposta.apresentacaoEmpresa,
        objetoOfertado: proposta.objetoOfertado,
        especificacaoTecnica: proposta.especificacaoTecnica,
        cronogramaImplantacao: proposta.cronogramaImplantacao,
        valorTotal: proposta.valorTotal,
        detalhamentoValor: proposta.detalhamentoValor,
        prazoValidadeDias: proposta.prazoValidadeDias,
        prazoExecucaoDias: proposta.prazoExecucaoDias,
        declaracoes: proposta.declaracoes,
        geradoEm: new Date().toLocaleDateString("pt-BR"),
      },
    })
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="proposta-${licitacao.pncpId}.pdf"`,
    },
  });
}
