import path from "path";
import { pathToFileURL } from "url";
import { PDFParse } from "pdf-parse";

// O Turbopack (dev) não copia o worker do pdfjs-dist para o chunk esperado,
// o que quebra a extração de texto com "Setting up fake worker failed".
// Apontar explicitamente para o arquivo real (como file:// URL — exigido
// pelo loader ESM do Node no Windows) evita depender desse chunk.
PDFParse.setWorker(
  pathToFileURL(
    path.join(process.cwd(), "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs")
  ).href
);

/**
 * Extrai o texto de um PDF a partir do buffer enviado, sem persistir o
 * arquivo original em nenhum storage.
 */
export async function extrairTextoPdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  try {
    const resultado = await parser.getText();
    return resultado.text.trim();
  } finally {
    await parser.destroy();
  }
}
