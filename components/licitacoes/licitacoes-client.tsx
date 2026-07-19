"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { PillToggle } from "@/components/ui/pill-toggle";
import { formatarValor } from "@/lib/format";
import { scoreMeta } from "@/lib/matching/score-meta";
import type { empresaLicitacaoMatches, licitacoes } from "@/lib/db/schema";

export type MatchRow = typeof empresaLicitacaoMatches.$inferSelect;
export type LicitacaoRow = typeof licitacoes.$inferSelect;

export function LicitacoesClient({
  resultados,
}: {
  resultados: {
    match: MatchRow;
    licitacao: LicitacaoRow;
    produtosRelacionados: string[];
  }[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [modalidadeFiltro, setModalidadeFiltro] = useState("todas");

  const modalidades = useMemo(() => {
    const unicas = [
      ...new Set(
        resultados
          .map((r) => r.licitacao.modalidade)
          .filter((m): m is string => !!m)
      ),
    ];
    return ["todas", ...unicas];
  }, [resultados]);

  const filtrados = resultados.filter(({ licitacao }) => {
    const term = search.trim().toLowerCase();
    const matchesSearch =
      !term ||
      licitacao.objeto.toLowerCase().includes(term) ||
      licitacao.orgaoNome.toLowerCase().includes(term);
    const matchesModalidade =
      modalidadeFiltro === "todas" || licitacao.modalidade === modalidadeFiltro;
    return matchesSearch && matchesModalidade;
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por objeto ou órgão…"
          className="min-w-[220px] flex-1"
        />
        <div className="flex flex-wrap gap-2">
          {modalidades.map((m) => (
            <PillToggle
              key={m}
              active={m === modalidadeFiltro}
              onClick={() => setModalidadeFiltro(m)}
            >
              {m === "todas" ? "Todas" : m}
            </PillToggle>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {filtrados.length === 0 && (
          <div className="py-10 text-center text-[13.5px] text-muted-foreground">
            Nenhuma licitação encontrada para esse filtro.
          </div>
        )}
        {filtrados.map(({ match, licitacao, produtosRelacionados }) => {
          const score = scoreMeta(Number(match.matchScore ?? 0));
          return (
            <div
              key={match.id}
              onClick={() => router.push(`/licitacoes/${licitacao.id}`)}
              className="flex cursor-pointer flex-col gap-2.5 rounded-[14px] border border-border bg-white p-5 shadow-sm transition-shadow hover:border-[#C9D4F5] hover:shadow-[0_6px_16px_rgba(47,95,222,0.10)]"
            >
              <div className="flex items-start justify-between gap-3.5">
                <div className="min-w-0">
                  <div className="text-[15px] font-bold">{licitacao.objeto}</div>
                  <div className="mt-1 text-[12.5px] text-muted-foreground">
                    {licitacao.orgaoNome} · {licitacao.modalidade}{" "}
                    {licitacao.uf ? `· ${licitacao.uf}` : ""}
                  </div>
                </div>
                <span
                  className="shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-bold"
                  style={{ background: score.bg, color: score.color }}
                >
                  {score.label}
                </span>
              </div>

              {produtosRelacionados.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {produtosRelacionados.map((nome) => (
                    <span
                      key={nome}
                      className="rounded-full bg-[#E3F5EC] px-2 py-0.5 text-[10.5px] font-bold text-[#12896B]"
                    >
                      {nome}
                    </span>
                  ))}
                </div>
              )}

              {match.matchReason && (
                <div className="flex gap-2 rounded-[10px] border border-[#E7E1FF] bg-[#F7F5FF] px-3 py-2.5">
                  <span className="h-fit shrink-0 rounded-md bg-[#7C5CFC] px-1.5 py-0.5 text-[9.5px] font-extrabold text-white">
                    IA
                  </span>
                  <p className="text-[12.5px] leading-snug text-[#4B4560]">
                    {match.matchReason}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">
                  {formatarValor(licitacao.valorEstimado)}
                </span>
                <div className="flex gap-3.5">
                  {licitacao.linkPortal && (
                    <a
                      href={licitacao.linkPortal}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[12.5px] font-bold text-primary hover:underline"
                    >
                      Ver no portal ↗
                    </a>
                  )}
                  {licitacao.linkEdital && (
                    <a
                      href={licitacao.linkEdital}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[12.5px] font-bold text-primary hover:underline"
                    >
                      Ver edital ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
