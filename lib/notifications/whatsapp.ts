/**
 * Envia uma mensagem de texto via Evolution API (instância própria do usuário).
 * Formato de envio compatível com Evolution API v2 (POST /message/sendText/{instance}).
 */
export async function enviarWhatsapp(
  numero: string,
  texto: string
): Promise<void> {
  const baseUrl = process.env.EVOLUTION_API_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;
  const instancia = process.env.EVOLUTION_INSTANCE;

  if (!baseUrl || !apiKey || !instancia) {
    throw new Error(
      "EVOLUTION_API_URL, EVOLUTION_API_KEY ou EVOLUTION_INSTANCE não configurados"
    );
  }

  const url = `${baseUrl.replace(/\/$/, "")}/message/sendText/${instancia}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: apiKey,
    },
    body: JSON.stringify({
      number: numero,
      text: texto,
    }),
  });

  if (!res.ok) {
    throw new Error(
      `Evolution API respondeu ${res.status} ${res.statusText}: ${await res.text()}`
    );
  }
}
