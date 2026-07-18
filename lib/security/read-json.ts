/**
 * Lê o corpo de uma requisição como JSON com limite de tamanho, evitando que
 * um payload gigante seja bufferizado em memória antes mesmo da validação
 * zod rodar (o App Router não impõe limite de corpo por padrão, diferente
 * do bodyParser do Pages Router).
 */
export async function readJsonComLimite(
  req: Request,
  maxBytes = 200_000
): Promise<{ ok: true; data: unknown } | { ok: false; status: number; error: string }> {
  const contentLength = req.headers.get("content-length");
  if (contentLength && Number(contentLength) > maxBytes) {
    return { ok: false, status: 413, error: "Corpo da requisição muito grande" };
  }

  if (!req.body) {
    return { ok: false, status: 400, error: "Corpo da requisição vazio" };
  }

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      return { ok: false, status: 413, error: "Corpo da requisição muito grande" };
    }
    chunks.push(value);
  }

  const buffer = Buffer.concat(chunks.map((c) => Buffer.from(c)));

  try {
    return { ok: true, data: JSON.parse(buffer.toString("utf-8")) };
  } catch {
    return { ok: false, status: 400, error: "JSON inválido" };
  }
}
