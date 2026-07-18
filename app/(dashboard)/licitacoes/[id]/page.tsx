import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { empresaLicitacaoMatches, licitacoes } from "@/lib/db/schema";
import { getEmpresaDoUsuario } from "@/lib/empresa";
import { garantirLinkEdital } from "@/lib/pncp/sync";
import { formatarValor } from "@/lib/format";
import { scoreMeta } from "@/lib/matching/score-meta";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

function pncpEntries(rawJson: unknown): { key: string; value: string }[] {
  if (!rawJson || typeof rawJson !== "object") return [];
  return Object.entries(rawJson as Record<string, unknown>)
    .filter(([, v]) => typeof v === "string" || typeof v === "number")
    .slice(0, 12)
    .map(([key, value]) => ({ key, value: String(value) }));
}

export default async function LicitacaoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const empresa = await getEmpresaDoUsuario(session!.user.id);
  if (!empresa) notFound();

  const [resultado] = await db
    .select({ match: empresaLicitacaoMatches, licitacao: licitacoes })
    .from(empresaLicitacaoMatches)
    .innerJoin(
      licitacoes,
      eq(licitacoes.id, empresaLicitacaoMatches.licitacaoId)
    )
    .where(
      and(
        eq(empresaLicitacaoMatches.empresaId, empresa.id),
        eq(licitacoes.id, id)
      )
    )
    .limit(1);

  if (!resultado) notFound();

  const { match } = resultado;
  let { licitacao } = resultado;

  if (!licitacao.linkEdital) {
    const linkEdital = await garantirLinkEdital(licitacao).catch(
      () => undefined
    );
    if (linkEdital) licitacao = { ...licitacao, linkEdital };
  }

  const score = scoreMeta(Number(match.matchScore ?? 0));

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/licitacoes"
        className="w-fit text-[13px] font-bold text-muted-foreground hover:text-foreground"
      >
        ← Voltar para Licitações
      </Link>

      <div className="rounded-[14px] border border-border bg-white shadow-sm">
        <div className="border-b border-border p-6">
          <h1 className="pr-8 text-[19px] font-extrabold leading-snug">
            {licitacao.objeto}
          </h1>
          <div className="mt-1.5 text-[13px] text-muted-foreground">
            {licitacao.orgaoNome} · {licitacao.modalidade}
            {licitacao.uf ? ` · ${licitacao.uf}` : ""}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            <span
              className="rounded-full px-2.5 py-1 text-[11.5px] font-bold"
              style={{ background: score.bg, color: score.color }}
            >
              {score.label}
            </span>
            <span className="text-[14px] font-bold">
              {formatarValor(licitacao.valorEstimado)}
            </span>
          </div>
        </div>

        <Tabs defaultValue="resumo" className="flex flex-1 flex-col gap-0">
          <TabsList
            variant="line"
            className="h-auto w-full justify-start gap-5 rounded-none border-b border-border bg-transparent px-6 py-0"
          >
            <TabsTrigger value="resumo" className="px-0 py-3">
              Resumo
            </TabsTrigger>
            <TabsTrigger value="objeto" className="px-0 py-3">
              Objeto completo
            </TabsTrigger>
            <TabsTrigger value="pncp" className="px-0 py-3">
              Dados do PNCP
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            <TabsContent value="resumo" className="flex flex-col gap-4">
              {match.matchReason && (
                <div className="rounded-xl border border-[#E7E1FF] bg-[#F7F5FF] p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-md bg-[#7C5CFC] px-1.5 py-0.5 text-[9.5px] font-extrabold text-white">
                      IA
                    </span>
                    <span className="text-[12.5px] font-bold text-[#4B4560]">
                      Justificativa do match
                    </span>
                  </div>
                  <p className="text-[13.5px] leading-relaxed text-[#453F58]">
                    {match.matchReason}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
                <div>
                  <div className="text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">
                    UF
                  </div>
                  <div className="mt-1 text-[13.5px]">{licitacao.uf ?? "—"}</div>
                </div>
                <div>
                  <div className="text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">
                    Modalidade
                  </div>
                  <div className="mt-1 text-[13.5px]">
                    {licitacao.modalidade ?? "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">
                    Município
                  </div>
                  <div className="mt-1 text-[13.5px]">
                    {licitacao.municipio ?? "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">
                    Publicado em
                  </div>
                  <div className="mt-1 text-[13.5px]">
                    {licitacao.dataPublicacao ?? "—"}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="objeto">
              <div className="mb-2 text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">
                Objeto completo
              </div>
              <p className="text-[13.5px] leading-relaxed">{licitacao.objeto}</p>
            </TabsContent>

            <TabsContent value="pncp">
              <div className="mb-1 text-[11.5px] font-bold uppercase tracking-wide text-muted-foreground">
                Dados brutos do PNCP
              </div>
              <div className="rounded-xl border border-border bg-[#F9FAFB] px-4 font-mono text-[12.5px] shadow-sm">
                {pncpEntries(licitacao.rawJson).map((entry) => (
                  <div
                    key={entry.key}
                    className="flex justify-between gap-3 border-b border-[#EEF0F3] py-2.5 last:border-0"
                  >
                    <span className="text-muted-foreground">{entry.key}</span>
                    <span className="text-right">{entry.value}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex gap-2.5 border-t border-border p-4.5">
          {licitacao.linkPortal && (
            <a
              href={licitacao.linkPortal}
              target="_blank"
              rel="noreferrer"
              className="flex-1"
            >
              <Button className="w-full">Ver no portal</Button>
            </a>
          )}
          {licitacao.linkEdital && (
            <a
              href={licitacao.linkEdital}
              target="_blank"
              rel="noreferrer"
              className="flex-1"
            >
              <Button variant="secondary" className="w-full">
                Ver edital
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
