import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { documentos, empresaLicitacaoMatches, licitacoes } from "@/lib/db/schema";
import { getEmpresaDoUsuario } from "@/lib/empresa";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DocumentosClient } from "@/components/documentos/documentos-client";

export default async function DocumentosPage() {
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

  const [listaDocumentos, licitacoesRelevantes] = await Promise.all([
    db
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
        checklistItemId: documentos.checklistItemId,
        conformeLei14133: documentos.conformeLei14133,
        motivoConformidade: documentos.motivoConformidade,
        createdAt: documentos.createdAt,
      })
      .from(documentos)
      .where(eq(documentos.empresaId, empresa.id))
      .orderBy(desc(documentos.createdAt)),
    db
      .select({ licitacao: licitacoes })
      .from(empresaLicitacaoMatches)
      .innerJoin(licitacoes, eq(licitacoes.id, empresaLicitacaoMatches.licitacaoId))
      .where(
        and(
          eq(empresaLicitacaoMatches.empresaId, empresa.id),
          eq(empresaLicitacaoMatches.status, "relevante")
        )
      )
      .orderBy(desc(empresaLicitacaoMatches.createdAt))
      .limit(50),
  ]);

  return (
    <DocumentosClient
      documentos={listaDocumentos}
      licitacoes={licitacoesRelevantes.map((l) => l.licitacao)}
    />
  );
}
