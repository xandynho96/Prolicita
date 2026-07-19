import Image from "next/image";
import Link from "next/link";
import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  documentos,
  empresaLicitacaoMatches,
  licitacoes,
  oportunidades,
  propostas,
} from "@/lib/db/schema";
import { getEmpresaDoUsuario } from "@/lib/empresa";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BuscarAgoraButton } from "@/components/dashboard/buscar-button";
import { formatarValor } from "@/lib/format";
import { scoreMeta } from "@/lib/matching/score-meta";
import { ETAPAS, ETAPA_META } from "@/lib/oportunidades/meta";
import {
  LicitacoesPorDiaChart,
  ModalidadesChart,
  PipelinePorEtapaChart,
} from "@/components/dashboard/charts";

export default async function DashboardPage() {
  const session = await auth();
  const empresa = await getEmpresaDoUsuario(session!.user.id);

  if (!empresa) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex w-full max-w-[520px] flex-col items-center gap-4.5 rounded-[18px] border border-border bg-white p-10 text-center shadow-sm">
          <Image
            src="/logo-prolicita.png"
            alt="ProLicita"
            width={200}
            height={44}
            className="h-auto w-[200px]"
          />
          <div className="text-xl font-extrabold">
            Bem-vindo(a) ao ProLicita
          </div>
          <p className="max-w-[400px] text-sm leading-relaxed text-muted-foreground">
            Para o radar encontrar as licitações certas, complete o perfil da
            sua empresa: segmento de atuação, região de interesse e
            modalidades. Leva menos de 5 minutos.
          </p>
          <Link href="/perfil" className="mt-1">
            <Button size="lg">Completar perfil</Button>
          </Link>
        </div>
      </div>
    );
  }

  const catorzeDiasAtras = new Date();
  catorzeDiasAtras.setDate(catorzeDiasAtras.getDate() - 13);
  catorzeDiasAtras.setHours(0, 0, 0, 0);

  const [
    [{ count: totalRelevantes }],
    docsAtencaoRows,
    recentes,
    matchesRecentes,
    etapaRows,
    modalidadeRows,
    [{ count: totalPropostas }],
    [{ count: totalGanhas }],
  ] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(empresaLicitacaoMatches)
      .where(
        and(
          eq(empresaLicitacaoMatches.empresaId, empresa.id),
          eq(empresaLicitacaoMatches.status, "relevante")
        )
      ),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(documentos)
      .where(
        and(
          eq(documentos.empresaId, empresa.id),
          inArray(documentos.status, ["vencido", "vencendo"])
        )
      ),
    db
      .select({ match: empresaLicitacaoMatches, licitacao: licitacoes })
      .from(empresaLicitacaoMatches)
      .innerJoin(
        licitacoes,
        eq(licitacoes.id, empresaLicitacaoMatches.licitacaoId)
      )
      .where(
        and(
          eq(empresaLicitacaoMatches.empresaId, empresa.id),
          eq(empresaLicitacaoMatches.status, "relevante")
        )
      )
      .orderBy(desc(empresaLicitacaoMatches.createdAt))
      .limit(5),
    db
      .select({ createdAt: empresaLicitacaoMatches.createdAt })
      .from(empresaLicitacaoMatches)
      .where(
        and(
          eq(empresaLicitacaoMatches.empresaId, empresa.id),
          eq(empresaLicitacaoMatches.status, "relevante"),
          gte(empresaLicitacaoMatches.createdAt, catorzeDiasAtras)
        )
      ),
    db
      .select({ etapa: oportunidades.etapa, count: sql<number>`count(*)::int` })
      .from(oportunidades)
      .where(eq(oportunidades.empresaId, empresa.id))
      .groupBy(oportunidades.etapa),
    db
      .select({
        modalidade: licitacoes.modalidade,
        count: sql<number>`count(*)::int`,
      })
      .from(empresaLicitacaoMatches)
      .innerJoin(
        licitacoes,
        eq(licitacoes.id, empresaLicitacaoMatches.licitacaoId)
      )
      .where(
        and(
          eq(empresaLicitacaoMatches.empresaId, empresa.id),
          eq(empresaLicitacaoMatches.status, "relevante")
        )
      )
      .groupBy(licitacoes.modalidade)
      .orderBy(desc(sql`count(*)`))
      .limit(6),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(propostas)
      .where(eq(propostas.empresaId, empresa.id)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(oportunidades)
      .where(
        and(eq(oportunidades.empresaId, empresa.id), eq(oportunidades.etapa, "ganha"))
      ),
  ]);

  const docsAtencao = docsAtencaoRows[0]?.count ?? 0;

  const porDia = Array.from({ length: 14 }, (_, i) => {
    const dia = new Date(catorzeDiasAtras);
    dia.setDate(dia.getDate() + i);
    const chave = dia.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
    return { chave, dia: chave, total: 0 };
  });
  for (const { createdAt } of matchesRecentes) {
    const chave = new Date(createdAt).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
    const bucket = porDia.find((d) => d.chave === chave);
    if (bucket) bucket.total += 1;
  }

  const etapaContagem = new Map(etapaRows.map((r) => [r.etapa, r.count]));
  const pipelinePorEtapa = ETAPAS.filter((e) => e !== "ignorada").map((etapa) => ({
    etapa: ETAPA_META[etapa].label,
    total: etapaContagem.get(etapa) ?? 0,
    color: ETAPA_META[etapa].color,
  }));

  const modalidades = modalidadeRows
    .filter((r) => r.modalidade)
    .map((r) => ({ modalidade: r.modalidade as string, total: r.count }));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <h1 className="text-[27px] font-extrabold tracking-tight">
            Visão geral
          </h1>
          <p className="mt-1.5 max-w-[560px] text-[14.5px] text-muted-foreground">
            Acompanhe as oportunidades encontradas pelo radar e dispare uma
            nova busca a qualquer momento.
          </p>
        </div>
        <BuscarAgoraButton />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="gap-1.5 py-5">
          <CardHeader className="px-5">
            <CardDescription className="text-xs font-bold uppercase tracking-wide">
              Licitações compatíveis
            </CardDescription>
            <CardTitle className="text-3xl">{totalRelevantes}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="gap-1.5 py-5">
          <CardHeader className="px-5">
            <CardDescription className="text-xs font-bold uppercase tracking-wide">
              Região monitorada
            </CardDescription>
            <CardTitle className="text-[19px]">
              {empresa.buscarBrasilTodo
                ? "Brasil (todo território)"
                : empresa.ufsBusca.length > 0
                  ? empresa.ufsBusca.join(", ")
                  : (empresa.uf ?? "Nacional")}
            </CardTitle>
            <p className="text-[12.5px] text-muted-foreground">
              Cron nacional a cada 6 horas
            </p>
          </CardHeader>
        </Card>
        <Card className="gap-1.5 py-5">
          <CardHeader className="px-5">
            <CardDescription className="text-xs font-bold uppercase tracking-wide">
              Documentos precisando de atenção
            </CardDescription>
            <CardTitle className="text-3xl text-destructive">
              {docsAtencao}
            </CardTitle>
            <p className="text-[12.5px] text-muted-foreground">
              Vencidos ou vencendo em 30 dias
            </p>
          </CardHeader>
        </Card>
        <Card className="gap-1.5 py-5">
          <CardHeader className="px-5">
            <CardDescription className="text-xs font-bold uppercase tracking-wide">
              Propostas geradas
            </CardDescription>
            <CardTitle className="text-3xl">{totalPropostas}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="gap-1.5 py-5">
          <CardHeader className="px-5">
            <CardDescription className="text-xs font-bold uppercase tracking-wide">
              Licitações ganhas
            </CardDescription>
            <CardTitle className="text-3xl text-[#12896B]">
              {totalGanhas}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="gap-1.5 py-5">
          <CardHeader className="px-5">
            <CardDescription className="text-xs font-bold uppercase tracking-wide">
              No pipeline
            </CardDescription>
            <CardTitle className="text-3xl">
              {ETAPAS.filter((e) => e !== "ignorada" && e !== "ganha" && e !== "perdida").reduce(
                (soma, etapa) => soma + (etapaContagem.get(etapa) ?? 0),
                0
              )}
            </CardTitle>
            <p className="text-[12.5px] text-muted-foreground">
              Oportunidades em andamento
            </p>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <LicitacoesPorDiaChart dados={porDia} />
        <PipelinePorEtapaChart dados={pipelinePorEtapa} />
        <ModalidadesChart dados={modalidades} />
      </div>

      <div>
        <div className="mb-3 text-[15px] font-extrabold">
          Últimas licitações encontradas
        </div>
        <div className="flex flex-col gap-2.5">
          {recentes.length === 0 && (
            <Card>
              <CardContent className="py-6 text-sm text-muted-foreground">
                Nenhuma licitação encontrada ainda. Clique em &quot;Buscar
                agora&quot; para rodar a primeira busca.
              </CardContent>
            </Card>
          )}
          {recentes.map(({ match, licitacao }) => {
            const score = scoreMeta(Number(match.matchScore ?? 0));
            return (
              <Link
                key={match.id}
                href="/licitacoes"
                className="flex items-center justify-between gap-3.5 rounded-xl border border-border bg-white p-4 shadow-sm transition-shadow hover:border-[#C9D4F5] hover:shadow-[0_6px_16px_rgba(47,95,222,0.10)]"
              >
                <div className="min-w-0">
                  <div className="text-sm font-bold">{licitacao.objeto}</div>
                  <div className="mt-0.5 text-[12.5px] text-muted-foreground">
                    {licitacao.orgaoNome} · {licitacao.modalidade}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2.5">
                  <span className="text-[13px] font-bold text-secondary-foreground">
                    {formatarValor(licitacao.valorEstimado)}
                  </span>
                  <span
                    className="rounded-full px-2.5 py-1 text-[11.5px] font-bold"
                    style={{ background: score.bg, color: score.color }}
                  >
                    {score.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
