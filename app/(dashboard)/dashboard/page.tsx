import Image from "next/image";
import Link from "next/link";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { documentos, empresaLicitacaoMatches, licitacoes } from "@/lib/db/schema";
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

  const [[{ count: totalRelevantes }], docsAtencaoRows, recentes] =
    await Promise.all([
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
    ]);

  const docsAtencao = docsAtencaoRows[0]?.count ?? 0;

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
