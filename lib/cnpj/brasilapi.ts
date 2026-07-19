export interface CnpjDados {
  razaoSocial: string;
  nomeFantasia: string | null;
  logradouro: string | null;
  numero: string | null;
  bairro: string | null;
  municipio: string | null;
  uf: string | null;
  cep: string | null;
  telefone: string | null;
  email: string | null;
  cnaes: string[];
  porte: string | null;
}

function limpar(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}

export async function buscarCnpj(cnpjDigitado: string): Promise<CnpjDados | null> {
  const cnpj = cnpjDigitado.replace(/\D/g, "");
  if (cnpj.length !== 14) return null;

  const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
    signal: AbortSignal.timeout(10000),
    headers: { "User-Agent": "ProLicita/1.0" },
  });
  if (!res.ok) return null;

  const data = await res.json();

  const cnaes = [
    data.cnae_fiscal_descricao,
    ...((data.cnaes_secundarios as { descricao?: string }[] | undefined)?.map(
      (c) => c.descricao
    ) ?? []),
  ]
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .slice(0, 20);

  const telefone =
    data.ddd_telefone_1 && typeof data.ddd_telefone_1 === "string"
      ? data.ddd_telefone_1
      : null;

  const porte = mapPorte(limpar(data.descricao_porte));

  return {
    razaoSocial: limpar(data.razao_social) ?? "",
    nomeFantasia: limpar(data.nome_fantasia),
    logradouro: limpar(data.logradouro),
    numero: limpar(data.numero),
    bairro: limpar(data.bairro),
    municipio: limpar(data.municipio),
    uf: limpar(data.uf),
    cep: limpar(data.cep),
    telefone,
    email: limpar(data.email),
    cnaes,
    porte,
  };
}

function mapPorte(descricao: string | null): string | null {
  if (!descricao) return null;
  const d = descricao.toUpperCase();
  if (d.includes("MICRO")) return "ME";
  if (d.includes("PEQUENO")) return "EPP";
  return null;
}
