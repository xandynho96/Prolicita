import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "./scroll-reveal";

const PLANOS = [
  {
    nome: "Básico",
    preco: "49,90",
    descricao: "Para quem quer o radar de licitações rodando no piloto automático.",
    destaque: false,
    recursos: [
      "Busca automática de licitações no PNCP",
      "Matching por IA com o perfil da empresa",
      "Alertas por painel, WhatsApp e email",
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
    <section id="planos" className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full border border-[#BFE7EF] bg-[#E7F6F9] px-3.5 py-1.5 text-[12px] font-bold text-[#0EA5C4]">
            Acesso antecipado · sem cobrança agora
          </span>
          <h2 className="mt-4 text-[27px] font-extrabold tracking-tight">
            Planos que cabem no seu tamanho
          </h2>
          <p className="mt-2.5 text-[15px] text-muted-foreground">
            Estes são os preços de lançamento. Enquanto estivermos em acesso
            antecipado, sua conta é <strong>100% gratuita</strong> — a gente
            avisa antes de qualquer cobrança começar, e quem se cadastrar
            agora garante esse valor.
          </p>
        </ScrollReveal>

        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
          {PLANOS.map((plano, i) => (
            <ScrollReveal key={plano.nome} delayMs={i * 120}>
              <div
                className={`relative flex h-full flex-col gap-6 rounded-[14px] border bg-white p-7 ${
                  plano.destaque
                    ? "border-transparent shadow-[0_16px_40px_rgba(14,165,196,0.16)] ring-2 ring-[#0EA5C4]/60"
                    : "border-border shadow-sm"
                }`}
              >
                {plano.destaque && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#0EA5C4] px-3 py-1 text-[11px] font-bold text-white">
                    Mais popular
                  </span>
                )}

                <div>
                  <div className="text-[15px] font-extrabold">{plano.nome}</div>
                  <p className="mt-1 text-[13px] text-muted-foreground">
                    {plano.descricao}
                  </p>
                </div>

                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[15px] font-bold text-muted-foreground">
                      R$
                    </span>
                    <span className="text-[38px] font-extrabold tracking-tight">
                      {plano.preco}
                    </span>
                    <span className="text-[13px] text-muted-foreground">/mês</span>
                  </div>
                  <p className="mt-1 text-[12px] font-semibold text-[#0B87A3]">
                    Grátis durante o acesso antecipado
                  </p>
                </div>

                <ul className="flex flex-col gap-2.5">
                  {plano.recursos.map((recurso) => (
                    <li key={recurso} className="flex items-start gap-2.5 text-[13.5px]">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0EA5C4]" />
                      <span>{recurso}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/cadastro" className="mt-auto">
                  <Button
                    className={`w-full ${
                      plano.destaque
                        ? "bg-[#0EA5C4] text-white hover:bg-[#0B87A3]"
                        : ""
                    }`}
                    variant={plano.destaque ? "default" : "outline"}
                    size="lg"
                  >
                    Começar grátis agora
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
