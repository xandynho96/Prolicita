import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLANOS = [
  {
    nome: "Básico",
    preco: "49,90",
    descricao: "Para quem quer o radar de licitações rodando no piloto automático.",
    destaque: false,
    recursos: [
      "Busca automática de licitações no PNCP",
      "Matching por IA com o perfil da empresa",
      "Alertas por painel e WhatsApp",
      "1 empresa cadastrada",
    ],
  },
  {
    nome: "Pro",
    preco: "89,90",
    descricao: "Acesso completo, do radar à proposta pronta.",
    destaque: true,
    recursos: [
      "Tudo do plano Básico",
      "CAPAG do órgão e checklist de habilitação (Lei 14.133/21)",
      "Pipeline Kanban de oportunidades",
      "Geração de propostas por IA + exportação em PDF",
      "Catálogo de produtos/serviços da empresa",
    ],
  },
];

export function Pricing() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-[27px] font-extrabold tracking-tight">
            Planos que cabem no seu tamanho
          </h2>
          <p className="mt-2.5 text-[15px] text-muted-foreground">
            Sem contrato de fidelidade. Cancele quando quiser.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
          {PLANOS.map((plano) => (
            <div
              key={plano.nome}
              className={`relative flex flex-col gap-6 rounded-[14px] border bg-white p-7 ${
                plano.destaque
                  ? "border-primary shadow-[0_12px_32px_rgba(47,95,222,0.14)]"
                  : "border-border shadow-sm"
              }`}
            >
              {plano.destaque && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground">
                  Mais popular
                </span>
              )}

              <div>
                <div className="text-[15px] font-extrabold">{plano.nome}</div>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {plano.descricao}
                </p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-[15px] font-bold text-muted-foreground">
                  R$
                </span>
                <span className="text-[38px] font-extrabold tracking-tight">
                  {plano.preco}
                </span>
                <span className="text-[13px] text-muted-foreground">/mês</span>
              </div>

              <ul className="flex flex-col gap-2.5">
                {plano.recursos.map((recurso) => (
                  <li key={recurso} className="flex items-start gap-2.5 text-[13.5px]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{recurso}</span>
                  </li>
                ))}
              </ul>

              <Link href="/cadastro" className="mt-auto">
                <Button
                  className="w-full"
                  variant={plano.destaque ? "default" : "outline"}
                  size="lg"
                >
                  Começar agora
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
