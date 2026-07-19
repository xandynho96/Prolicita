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
  produtos?: { nome: string; descricaoResumida: string }[];
  valorMinimo?: string | null;
  valorMaximo?: string | null;
  objetoLicitacao: string;
  valorEstimadoLicitacao?: string | null;
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
  const produtos = (input.produtos ?? [])
    .slice(0, 20)
    .map((p) => `- ${p.nome.slice(0, 200)}: ${p.descricaoResumida.slice(0, 500)}`)
    .join("\n");

  const faixaValor =
    input.valorMinimo || input.valorMaximo
      ? `R$${input.valorMinimo ?? "0"} a R$${input.valorMaximo ?? "sem limite"}`
      : "(sem faixa definida)";

  const prompt = `Perfil da empresa:
- Descrição: ${descricaoPerfil || "(não informado)"}
- Palavras-chave de interesse: ${palavrasChave || "(nenhuma)"}
- CNAEs: ${cnaes || "(nenhum)"}
- Faixa de valor de contrato de interesse: ${faixaValor} (contexto — não é regra rígida; contratos fora da faixa ainda podem ser relevantes, avalie pelo mérito)
${produtos ? `- Produtos/serviços oferecidos:\n${produtos}` : ""}

Licitação publicada:
- Órgão: ${input.orgaoNome.slice(0, 300)}
- Modalidade: ${input.modalidade ?? "(não informado)"}
- Valor estimado: ${input.valorEstimadoLicitacao ?? "(não informado)"}
- Objeto: ${input.objetoLicitacao.slice(0, 3000)}

Essa licitação é uma oportunidade de negócio relevante para essa empresa,
dado o perfil e os produtos/serviços dela? Se algum produto específico do
catálogo atende ao objeto, cite o nome dele no motivo. Responda somente em
JSON no formato:
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
