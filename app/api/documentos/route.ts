import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { documentos } from "@/lib/db/schema";
import { getEmpresaDoUsuario } from "@/lib/empresa";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const empresa = await getEmpresaDoUsuario(session.user.id);
  if (!empresa) {
    return NextResponse.json({ documentos: [] });
  }

  const lista = await db
    .select({
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
    })
    .from(documentos)
    .where(eq(documentos.empresaId, empresa.id))
    .orderBy(desc(documentos.createdAt));

  return NextResponse.json({ documentos: lista });
}
