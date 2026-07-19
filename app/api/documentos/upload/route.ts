import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { documentos, licitacoes } from "@/lib/db/schema";
import { getEmpresaDoUsuario } from "@/lib/empresa";
import { extrairTextoPdf } from "@/lib/documentos/pdf-text";
import { analisarDocumento } from "@/lib/documentos/ai-analyze";
import { compararComEdital } from "@/lib/documentos/ai-compare";
import { calcularStatus } from "@/lib/documentos/status";
import { documentoManualSchema } from "@/lib/validation";
import { buscarChecklistItem } from "@/lib/documentos/checklist";

export const maxDuration = 60;

const CATEGORIAS = [
  "juridico",
  "fiscal",
  "tecnico",
  "economico",
  "declaracoes",
  "propostas",
  "editais",
] as const;
const TAMANHO_MAXIMO_BYTES = 10 * 1024 * 1024;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const empresa = await getEmpresaDoUsuario(session.user.id);
  if (!empresa) {
    return NextResponse.json(
      { error: "Cadastre o perfil da sua empresa antes de enviar documentos" },
      { status: 400 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const licitacaoId = formData.get("licitacaoId");
  const semVencimentoManual = formData.get("semVencimento") === "true";

  const checklistItemId = String(formData.get("checklistItemId") ?? "") || null;
  const checklistItem = buscarChecklistItem(checklistItemId);
  const categoria = checklistItem
    ? checklistItem.grupo
    : String(formData.get("categoria") ?? "");

  const camposManuais = documentoManualSchema.safeParse({
    nome: formData.get("nome") || undefined,
    numeroIdentificacao: formData.get("numeroIdentificacao") || undefined,
    dataValidade: formData.get("dataValidade") || undefined,
  });
  if (!camposManuais.success) {
    return NextResponse.json(
      { error: camposManuais.error.issues[0]?.message ?? "Dados inválidos" },
      { status: 400 }
    );
  }
  const {
    nome: nomeManual,
    numeroIdentificacao: numeroManual,
    dataValidade: dataValidadeManual,
  } = camposManuais.data;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo não enviado" }, { status: 400 });
  }
  if (!CATEGORIAS.includes(categoria as (typeof CATEGORIAS)[number])) {
    return NextResponse.json({ error: "Categoria inválida" }, { status: 400 });
  }
  if (file.size > TAMANHO_MAXIMO_BYTES) {
    return NextResponse.json(
      { error: "Arquivo maior que o limite de 10MB" },
      { status: 400 }
    );
  }

  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  const buffer = Buffer.from(await file.arrayBuffer());
  const arquivoBase64 = buffer.toString("base64");
  const arquivoMime = file.type || "application/octet-stream";
  const arquivoNomeOriginal = file.name.slice(0, 255);
  const arquivoTamanho = file.size;

  let textoExtraido: string | null = null;
  let nome = nomeManual ?? checklistItem?.nome ?? file.name.slice(0, 200);
  let numeroIdentificacao = numeroManual ?? null;
  let dataValidade = dataValidadeManual ?? null;
  let semVencimento = semVencimentoManual;
  let aiResumo: string | null = null;
  let aiPendencias: string[] = [];
  let aiSugestoes: string[] = [];
  let conformeLei14133: boolean | null = null;
  let motivoConformidade: string | null = null;

  if (isPdf) {
    try {
      textoExtraido = await extrairTextoPdf(buffer);

      if (textoExtraido) {
        const analise = await analisarDocumento(
          textoExtraido,
          categoria,
          checklistItem
            ? { nome: checklistItem.nome, baseLegal: checklistItem.baseLegal }
            : undefined
        );
        nome = nomeManual ?? analise.nome;
        numeroIdentificacao = numeroManual ?? analise.numeroIdentificacao;
        dataValidade = dataValidadeManual ?? analise.dataValidade;
        semVencimento = semVencimentoManual || analise.semVencimento;
        aiResumo = analise.resumo;
        aiPendencias = analise.pendencias;
        aiSugestoes = analise.sugestoes;
        conformeLei14133 = analise.conforme;
        motivoConformidade = analise.motivoConformidade;
      }
    } catch (err) {
      console.error("Falha ao extrair/analisar PDF:", err);
    }
  }

  let aiComparacaoEdital: { requisito: string; atende: boolean; obs: string }[] =
    [];
  let licitacaoVinculadaId: string | null = null;

  if (typeof licitacaoId === "string" && licitacaoId) {
    const [licitacao] = await db
      .select()
      .from(licitacoes)
      .where(eq(licitacoes.id, licitacaoId))
      .limit(1);

    if (licitacao) {
      licitacaoVinculadaId = licitacao.id;
      if (textoExtraido) {
        try {
          aiComparacaoEdital = await compararComEdital(
            textoExtraido,
            licitacao.objeto
          );
        } catch (err) {
          console.error("Falha ao comparar documento com edital:", err);
        }
      }
    }
  }

  const status = calcularStatus(dataValidade, semVencimento);

  const [documento] = await db
    .insert(documentos)
    .values({
      empresaId: empresa.id,
      categoria: categoria as (typeof CATEGORIAS)[number],
      nome,
      numeroIdentificacao,
      dataValidade,
      semVencimento,
      status,
      textoExtraido,
      aiResumo,
      aiPendencias,
      aiSugestoes,
      licitacaoVinculadaId,
      aiComparacaoEdital,
      arquivoBase64,
      arquivoMime,
      arquivoNomeOriginal,
      arquivoTamanho,
      checklistItemId,
      conformeLei14133,
      motivoConformidade,
    })
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
      checklistItemId: documentos.checklistItemId,
      conformeLei14133: documentos.conformeLei14133,
      motivoConformidade: documentos.motivoConformidade,
      createdAt: documentos.createdAt,
    });

  return NextResponse.json({ documento });
}
