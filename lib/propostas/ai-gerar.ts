const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

export interface PropostaGerada {
  produtosSelecionadosIds: string[];
  apresentacaoEmpresa: string;
  objetoOfertado: string;
  especificacaoTecnica: string;
  cronogramaImplantacao: string;
  detalhamentoValor: string;
  prazoExecucaoDias: number | null;
  declaracoes: string;
}

interface GerarPropostaInput {
  empresa: {
    razaoSocial: string;
    descricaoPerfil: string | null;
  };
  produtos: { id: string; nome: string; descricaoResumida: string; descricaoDetalhada: string | null }[];
  licitacao: {
    objeto: string;
    orgaoNome: string;
    modalidade: string | null;
    valorEstimado: string | null;
  };
}

function parseResposta(
  conteudo: string,
  produtosValidos: Set<string>
): PropostaGerada {
  const parsed = JSON.parse(conteudo);
  const idsSelecionados = Array.isArray(parsed.produtosSelecionadosIds)
    ? parsed.produtosSelecionadosIds
        .map((id: unknown) => String(id))
        .filter((id: string) => produtosValidos.has(id))
        .slice(0, 10)
    : [];

  return {
    produtosSelecionadosIds: idsSelecionados,
    apresentacaoEmpresa: String(parsed.apresentacaoEmpresa ?? "").slice(0, 3000),
    objetoOfertado: String(parsed.objetoOfertado ?? "").slice(0, 2000),
    especificacaoTecnica: String(parsed.especificacaoTecnica ?? "").slice(0, 4000),
    cronogramaImplantacao: String(parsed.cronogramaImplantacao ?? "").slice(0, 2000),
    detalhamentoValor: String(parsed.detalhamentoValor ?? "").slice(0, 2000),
    prazoExecucaoDias:
      Number.isFinite(Number(parsed.prazoExecucaoDias)) && Number(parsed.prazoExecucaoDias) > 0
        ? Math.round(Number(parsed.prazoExecucaoDias))
        : null,
    declaracoes: String(parsed.declaracoes ?? "").slice(0, 2000),
  };
}

/**
 * Gera um rascunho de proposta técnica/comercial (elementos formais
 * comuns sob a Lei 14.133/21) a partir do objeto da licitação e do
 * catálogo de produtos da empresa. É um RASCUNHO — precisa de revisão
 * humana antes do envio ao órgão licitante.
 */
export async function gerarProposta(
  input: GerarPropostaInput
): Promise<PropostaGerada> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY não está configurada");
  }

  const produtosTexto = input.produtos
    .slice(0, 20)
    .map(
      (p) =>
        `- id="${p.id}" | ${p.nome.slice(0, 200)}: ${p.descricaoResumida.slice(0, 500)}${
          p.descricaoDetalhada ? ` | Detalhes: ${p.descricaoDetalhada.slice(0, 800)}` : ""
        }`
    )
    .join("\n");

  const prompt = `Empresa: ${input.empresa.razaoSocial}
Descrição da empresa: ${(input.empresa.descricaoPerfil ?? "").slice(0, 1500)}

Catálogo de produtos/serviços da empresa (use o campo "id" exato ao
selecionar produtos relevantes):
${produtosTexto || "(nenhum produto cadastrado)"}

Licitação:
- Órgão: ${input.licitacao.orgaoNome.slice(0, 300)}
- Modalidade: ${input.licitacao.modalidade ?? "(não informado)"}
- Valor estimado: ${input.licitacao.valorEstimado ?? "(não informado)"}
- Objeto: ${input.licitacao.objeto.slice(0, 3000)}

Redija um RASCUNHO de proposta técnica/comercial para essa licitação
pública brasileira, seguindo os elementos formais mais comuns sob a Lei
14.133/21 (o edital específico pode exigir formato adicional — isto é só
um ponto de partida a ser revisado). Selecione, dentre o catálogo, os
produtos que efetivamente respondem ao objeto (pelo "id"). Responda
SOMENTE em JSON no formato:
{
  "produtosSelecionadosIds": ["id1", "id2"],
  "apresentacaoEmpresa": "parágrafo de apresentação institucional da empresa, em português",
  "objetoOfertado": "descrição do objeto ofertado, alinhado ao objeto do edital",
  "especificacaoTecnica": "especificação técnica da solução ofertada, citando os produtos selecionados e suas funcionalidades relevantes ao objeto",
  "cronogramaImplantacao": "cronograma sugerido de implantação em etapas (texto, não tabela)",
  "detalhamentoValor": "texto explicando o que compõe o valor (licenciamento, implantação, treinamento, suporte) sem inventar um valor numérico específico",
  "prazoExecucaoDias": number (prazo de execução/implantação sugerido em dias, estimativa razoável para o escopo),
  "declaracoes": "texto com as declarações padrão do licitante (pleno conhecimento do edital, preços incluem todos os custos, etc.)"
}`;

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
            "Você é um assistente que redige rascunhos de propostas técnicas/comerciais para licitações públicas brasileiras (Lei 14.133/21), a partir do catálogo de produtos de uma empresa. Responda sempre em JSON válido. Nunca invente certificações, atestados ou dados que não foram fornecidos.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
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

  const produtosValidos = new Set(input.produtos.map((p) => p.id));
  return parseResposta(conteudo, produtosValidos);
}
