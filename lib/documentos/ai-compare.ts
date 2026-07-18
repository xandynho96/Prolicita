const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

export interface RequisitoComparado {
  requisito: string;
  atende: boolean;
  obs: string;
}

function parseResposta(conteudo: string): RequisitoComparado[] {
  const parsed = JSON.parse(conteudo);
  const lista = Array.isArray(parsed.requisitos) ? parsed.requisitos : [];
  return lista.slice(0, 15).map((r: Record<string, unknown>) => ({
    requisito: String(r.requisito ?? "").slice(0, 300),
    atende: Boolean(r.atende),
    obs: String(r.obs ?? "").slice(0, 300),
  }));
}

/**
 * Compara o texto de um documento com o objeto de uma licitação, apontando
 * quais exigências ele atende ou não.
 */
export async function compararComEdital(
  textoDocumento: string,
  objetoLicitacao: string
): Promise<RequisitoComparado[]> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY não está configurada");
  }

  const prompt = `Objeto da licitação:
"""
${objetoLicitacao.slice(0, 2000)}
"""

Texto do documento da empresa:
"""
${textoDocumento.slice(0, 6000)}
"""

Com base no objeto da licitação, liste até 5 exigências de habilitação
plausíveis para esse tipo de contratação pública brasileira e diga, para
cada uma, se o documento apresentado atende ou não (com base no que está
escrito nele). Responda SOMENTE em JSON no formato:
{"requisitos": [{"requisito": "descrição da exigência", "atende": boolean, "obs": "observação curta"}]}`;

  const res = await fetch(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "Você é um assistente que avalia documentação de habilitação para licitações públicas brasileiras. Responda sempre em JSON válido.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    throw new Error(
      `DeepSeek respondeu ${res.status} ${res.statusText}: ${await res.text()}`
    );
  }

  const data = await res.json();
  const conteudo = data.choices?.[0]?.message?.content;
  if (!conteudo) {
    throw new Error("Resposta da DeepSeek sem conteúdo");
  }

  return parseResposta(conteudo);
}
