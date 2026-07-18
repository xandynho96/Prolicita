import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { documentos, licitacoes } from "@/lib/db/schema";
import { getEmpresaDoUsuario } from "@/lib/empresa";
import { analisarDocumento } from "@/lib/documentos/ai-analyze";
import { compararComEdital } from "@/lib/documentos/ai-compare";
import { calcularStatus } from "@/lib/documentos/status";

export const maxDuration = 60;

export async function POST(
  req: Request,
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

  const [documento] = await db
    .select()
    .from(documentos)
    .where(and(eq(documentos.id, id), eq(documentos.empresaId, empresa.id)))
    .limit(1);

  if (!documento) {
    return NextResponse.json(
      { error: "Documento não encontrado" },
      { status: 404 }
    );
  }
  if (!documento.textoExtraido) {
    return NextResponse.json(
      { error: "Este documento não tem texto extraído para reanalisar" },
      { status: 400 }
    );
  }

  const analise = await analisarDocumento(documento.textoExtraido, documento.categoria);

  let aiComparacaoEdital = documento.aiComparacaoEdital ?? [];
  if (documento.licitacaoVinculadaId) {
    const [licitacao] = await db
      .select()
      .from(licitacoes)
      .where(eq(licitacoes.id, documento.licitacaoVinculadaId))
      .limit(1);
    if (licitacao) {
      aiComparacaoEdital = await compararComEdital(
        documento.textoExtraido,
        licitacao.objeto
      );
    }
  }

  const dataValidade = documento.dataValidade ?? analise.dataValidade;
  const semVencimento = documento.semVencimento || analise.semVencimento;
  const status = calcularStatus(dataValidade, semVencimento);

  const [atualizado] = await db
    .update(documentos)
    .set({
      aiResumo: analise.resumo,
      aiPendencias: analise.pendencias,
      aiSugestoes: analise.sugestoes,
      aiComparacaoEdital,
      dataValidade,
      semVencimento,
      status,
    })
    .where(eq(documentos.id, id))
    .returning({
      id: documentos.id,
      empresaId: documentos.empresaId,
      categoria: documentos.categoria,
      nome: documentos.nome,
      numeroIdentificacao: documentos.numeroIdentificacao,
      dataValidade: documentos.dataValidade,
      semVencimento: documentos.semVencimento,
      status: documentos.status,
      textoExtraido: documentos.textoExtraido,
      aiResumo: documentos.aiResumo,
      aiPendencias: documentos.aiPendencias,
      aiSugestoes: documentos.aiSugestoes,
      licitacaoVinculadaId: documentos.licitacaoVinculadaId,
      aiComparacaoEdital: documentos.aiComparacaoEdital,
      arquivoMime: documentos.arquivoMime,
      arquivoNomeOriginal: documentos.arquivoNomeOriginal,
      arquivoTamanho: documentos.arquivoTamanho,
      createdAt: documentos.createdAt,
    });

  return NextResponse.json({ documento: atualizado });
}
