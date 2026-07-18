import {
  MODALIDADES_CONTRATACAO,
  PncpArquivo,
  PncpContratacao,
  PncpPublicacaoResponse,
} from "./types";

const BASE_URL = "https://pncp.gov.br/api/consulta/v1";
const TAMANHO_PAGINA = 50;

function formatDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchJson<T>(url: string, tentativa = 0): Promise<T | null> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    // PNCP pode ser lento; evita cache indevido de dados que mudam a cada busca
    cache: "no-store",
  });

  // PNCP responde 204 (sem corpo) quando não há resultados para a consulta
  if (res.status === 204) return null;

  if (res.status === 429 && tentativa < 3) {
    await sleep(1000 * 2 ** tentativa);
    return fetchJson<T>(url, tentativa + 1);
  }

  if (!res.ok) {
    throw new Error(
      `PNCP respondeu ${res.status} ${res.statusText} para ${url}`
    );
  }

  const texto = await res.text();
  if (!texto) return null;

  return JSON.parse(texto) as T;
}

/**
 * Busca todas as contratações publicadas no PNCP em um intervalo de datas,
 * para uma modalidade de contratação específica, paginando até o fim.
 */
async function buscarPorModalidade(
  dataInicial: string,
  dataFinal: string,
  codigoModalidadeContratacao: number,
  uf?: string
): Promise<PncpContratacao[]> {
  const resultados: PncpContratacao[] = [];
  let pagina = 1;

  while (true) {
    const params = new URLSearchParams({
      dataInicial,
      dataFinal,
      codigoModalidadeContratacao: String(codigoModalidadeContratacao),
      pagina: String(pagina),
      tamanhoPagina: String(TAMANHO_PAGINA),
    });
    if (uf) params.set("uf", uf);

    const url = `${BASE_URL}/contratacoes/publicacao?${params.toString()}`;
    const data = await fetchJson<PncpPublicacaoResponse>(url);

    if (!data || data.empty || data.data.length === 0) break;

    resultados.push(...data.data);

    if (pagina >= data.totalPaginas) break;
    pagina += 1;
    await sleep(300);
  }

  return resultados;
}

/**
 * Busca contratações publicadas nos últimos `diasRetroativos` dias,
 * percorrendo todas as modalidades de contratação selecionadas e,
 * quando `ufs` é informado, uma UF por vez (o PNCP só aceita uma UF por
 * chamada). `ufs` vazio/`undefined` = busca nacional, sem filtro de UF.
 */
export async function buscarContratacoesPublicadas(options?: {
  diasRetroativos?: number;
  ufs?: string[];
  modalidades?: number[];
}): Promise<PncpContratacao[]> {
  const diasRetroativos = options?.diasRetroativos ?? 2;
  const modalidades =
    options?.modalidades ?? Object.keys(MODALIDADES_CONTRATACAO).map(Number);
  const ufs = options?.ufs && options.ufs.length > 0 ? options.ufs : [undefined];

  const hoje = new Date();
  const inicio = new Date(hoje);
  inicio.setDate(inicio.getDate() - diasRetroativos);

  const dataInicial = formatDate(inicio);
  const dataFinal = formatDate(hoje);

  const todas: PncpContratacao[] = [];

  for (const uf of ufs) {
    for (const modalidade of modalidades) {
      try {
        const contratacoes = await buscarPorModalidade(
          dataInicial,
          dataFinal,
          modalidade,
          uf
        );
        todas.push(...contratacoes);
      } catch (err) {
        console.error(
          `Falha ao buscar contratações da modalidade ${modalidade}${uf ? ` (${uf})` : ""}:`,
          err
        );
      }
      await sleep(300);
    }
  }

  return todas;
}

/**
 * Lista os arquivos/documentos (edital, anexos) de uma contratação específica.
 */
export async function buscarArquivosContratacao(
  cnpjOrgao: string,
  anoCompra: number,
  sequencialCompra: number
): Promise<PncpArquivo[]> {
  const url = `https://pncp.gov.br/api/pncp/v1/orgaos/${cnpjOrgao}/compras/${anoCompra}/${sequencialCompra}/arquivos`;
  try {
    const data = await fetchJson<PncpArquivo[]>(url);
    return data ?? [];
  } catch (err) {
    console.error("Falha ao buscar arquivos da contratação:", err);
    return [];
  }
}

export function montarLinkPortal(
  cnpjOrgao: string,
  anoCompra: number,
  sequencialCompra: number
): string {
  return `https://pncp.gov.br/app/editais/${cnpjOrgao}/${anoCompra}/${sequencialCompra}`;
}
