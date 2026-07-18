import { PDFParse } from "pdf-parse";

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
