const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

export interface AnaliseDocumento {
  nome: string;
  numeroIdentificacao: string | null;
  dataValidade: string | null;
  semVencimento: boolean;
  resumo: string;
  pendencias: string[];
  sugestoes: string[];
  conforme: boolean | null;
  motivoConformidade: string | null;
}

export interface Requisito {
  nome: string;
  baseLegal: string;
}

const CATEGORIA_LABEL: Record<string, string> = {
  juridico: "Jurídico",
  fiscal: "Fiscal",
  tecnico: "Técnico",
  economico: "Econômico-financeiro",
  declaracoes: "Declarações",
  propostas: "Propostas",
  editais: "Editais",
};

function parseResposta(conteudo: string, comRequisito: boolean): AnaliseDocumento {
  const parsed = JSON.parse(conteudo);
  return {
    nome: String(parsed.nome ?? "Documento sem título").slice(0, 200),
    numeroIdentificacao: parsed.numeroIdentificacao
      ? String(parsed.numeroIdentificacao).slice(0, 200)
      : null,
    dataValidade: parsed.dataValidade ? String(parsed.dataValidade) : null,
    semVencimento: Boolean(parsed.semVencimento),
    resumo: String(parsed.resumo ?? "").slice(0, 800),
    pendencias: Array.isArray(parsed.pendencias)
      ? parsed.pendencias.map((p: unknown) => String(p)).slice(0, 10)
      : [],
    sugestoes: Array.isArray(parsed.sugestoes)
      ? parsed.sugestoes.map((s: unknown) => String(s)).slice(0, 10)
      : [],
    conforme: comRequisito ? Boolean(parsed.conforme) : null,
    motivoConformidade: comRequisito
      ? String(parsed.motivoConformidade ?? "").slice(0, 800)
      : null,
  };
}

/**
 * Usa a API do DeepSeek para extrair metadados e gerar um resumo de um
 * documento empresarial a partir do texto extraído do PDF.
 */
export async function analisarDocumento(
  texto: string,
  categoria: string,
  requisito?: Requisito
): Promise<AnaliseDocumento> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY não está configurada");
  }

  const textoTruncado = texto.slice(0, 8000);
  const hoje = new Date().toISOString().slice(0, 10);

  const blocoRequisito = requisito
    ? `\nEste documento deve atender ao seguinte requisito de habilitação da
Lei 14.133/21: "${requisito.nome.slice(0, 300)}" (${requisito.baseLegal.slice(0, 100)}).
Avalie especificamente se o CONTEÚDO do documento atende a esse requisito
— não apenas se o tipo de documento parece correto.\n`
    : "";

  const camposConformidade = requisito
    ? `,
  "conforme": boolean (true se o documento atende ao requisito legal informado, considerando também se está dentro da validade),
  "motivoConformidade": "justificativa em até 2 frases, em português, citando o que foi verificado"`
    : "";

  const prompt = `Categoria do documento: ${CATEGORIA_LABEL[categoria] ?? categoria}
Data de hoje: ${hoje}
${blocoRequisito}
Texto extraído do documento:
"""
${textoTruncado}
"""

Analise este documento empresarial (usado para participar de licitações
públicas brasileiras) e responda SOMENTE em JSON no formato:
{
  "nome": "nome/título curto do documento",
  "numeroIdentificacao": "número, protocolo ou identificação, ou null se não houver",
  "dataValidade": "AAAA-MM-DD da data de validade encontrada no texto, ou null se não encontrar",
  "semVencimento": boolean (true se o documento não tem prazo de validade, ex: contrato social),
  "resumo": "resumo em até 3 frases, em português, do conteúdo e relevância do documento",
  "pendencias": ["lista curta de pendências/problemas identificados, vazio se nenhuma"],
  "sugestoes": ["lista curta de sugestões de ação para a empresa, vazio se nenhuma"]${camposConformidade}
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
            "Você é um assistente que analisa documentos empresariais brasileiros (certidões, contratos, atestados, editais) para uso em licitações públicas, avaliando conformidade com a Lei 14.133/21 quando solicitado. Isso é apoio operacional, não parecer jurídico. Responda sempre em JSON válido.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
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

  return parseResposta(conteudo, !!requisito);
}
