const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

export interface AvaliacaoMatch {
  match: boolean;
  score: number;
  motivo: string;
}

interface AvaliarMatchInput {
  descricaoPerfil: string | null;
  palavrasChave: string[];
  cnaes: string[];
  objetoLicitacao: string;
  modalidade?: string | null;
  orgaoNome: string;
}

function parseResposta(conteudo: string): AvaliacaoMatch {
  const parsed = JSON.parse(conteudo);
  return {
    match: Boolean(parsed.match),
    score: Number(parsed.score) || 0,
    motivo: String(parsed.motivo ?? "").slice(0, 500),
  };
}

/**
 * Usa a API do DeepSeek para decidir se o objeto de uma licitação
 * é compatível com o perfil da empresa.
 */
export async function avaliarMatchIA(
  input: AvaliarMatchInput
): Promise<AvaliacaoMatch> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY não está configurada");
  }

  const descricaoPerfil = (input.descricaoPerfil ?? "").slice(0, 2000);
  const palavrasChave = input.palavrasChave.slice(0, 30).join(", ");
  const cnaes = input.cnaes.slice(0, 30).join(", ");

  const prompt = `Perfil da empresa:
- Descrição: ${descricaoPerfil || "(não informado)"}
- Palavras-chave de interesse: ${palavrasChave || "(nenhuma)"}
- CNAEs: ${cnaes || "(nenhum)"}

Licitação publicada:
- Órgão: ${input.orgaoNome.slice(0, 300)}
- Modalidade: ${input.modalidade ?? "(não informado)"}
- Objeto: ${input.objetoLicitacao.slice(0, 3000)}

Essa licitação é uma oportunidade de negócio relevante para essa empresa,
dado o perfil dela? Responda somente em JSON no formato:
{"match": boolean, "score": number de 0 a 100, "motivo": "explicação em até 2 frases, em português"}`;

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
            "Você é um assistente que avalia se licitações públicas brasileiras são relevantes para o perfil de uma empresa. Responda sempre em JSON válido.",
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
