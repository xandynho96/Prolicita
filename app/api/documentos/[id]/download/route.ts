import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { documentos } from "@/lib/db/schema";
import { getEmpresaDoUsuario } from "@/lib/empresa";

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

  const [documento] = await db
    .select({
      arquivoBase64: documentos.arquivoBase64,
      arquivoMime: documentos.arquivoMime,
      arquivoNomeOriginal: documentos.arquivoNomeOriginal,
    })
    .from(documentos)
    .where(and(eq(documentos.id, id), eq(documentos.empresaId, empresa.id)))
    .limit(1);

  if (!documento || !documento.arquivoBase64) {
    return NextResponse.json(
      { error: "Arquivo original não disponível para este documento" },
      { status: 404 }
    );
  }

  const bytes = Buffer.from(documento.arquivoBase64, "base64");
  const nomeArquivo = documento.arquivoNomeOriginal ?? "documento";

  return new NextResponse(bytes, {
    headers: {
      "Content-Type": documento.arquivoMime ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(nomeArquivo)}"`,
      "Content-Length": String(bytes.byteLength),
    },
  });
}
