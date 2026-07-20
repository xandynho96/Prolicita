import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrowserFrame } from "./browser-frame";
import { ScrollReveal } from "./scroll-reveal";

const DESTAQUES = [
  "Radar automático no PNCP com IA especializada",
  "Encontre licitações e acompanhe cada oportunidade",
  "Checklist de habilitação e propostas geradas por IA",
  "Alertas em tempo real pelo painel e por WhatsApp",
];

export function Hero({ totalLicitacoes }: { totalLicitacoes: number }) {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-20">
        <div className="flex flex-col gap-6">
          <span className="w-fit rounded-full border border-[#CDEBDF] bg-[#EAF7F1] px-3.5 py-1.5 text-[12.5px] font-bold text-[#0F9D6F]">
            Acesso antecipado aberto — grátis por enquanto
          </span>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-[#101828] sm:text-[46px]">
            Plataforma de licitações para fornecedores do governo
          </h1>
          <p className="max-w-lg text-[16.5px] leading-relaxed text-muted-foreground">
            O ProLicita monitora o PNCP automaticamente, usa IA para
            encontrar as licitações compatíveis com o perfil da sua empresa e
            organiza tudo — do primeiro contato até a proposta — num só
            painel.
          </p>

          <ul className="flex flex-col gap-2.5">
            {DESTAQUES.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[14.5px] font-medium text-[#344054]">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EAF7F1] text-[#0F9D6F]">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/cadastro">
              <Button
                size="lg"
                className="bg-[#0F9D6F] text-white hover:bg-[#0C7F59]"
              >
                Cadastre-se gratuitamente
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Já tenho conta
              </Button>
            </Link>
          </div>
        </div>

        <ScrollReveal className="relative">
          <div
            aria-hidden
            className="absolute -inset-6 -z-10 rounded-[32px] bg-[#EAF7F1]"
          />
          <BrowserFrame
            src="/screenshots/dashboard.png"
            alt="Visão geral do ProLicita com gráficos de licitações compatíveis, pipeline por etapa e modalidades mais frequentes"
            width={1440}
            height={900}
            priority
          />

          <div className="absolute -bottom-5 -left-5 hidden rounded-[12px] border border-border bg-white px-4 py-3 shadow-lg sm:block">
            <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Licitações compatíveis
            </div>
            <div className="text-[22px] font-extrabold text-[#0F9D6F]">
              +{totalLicitacoes.toLocaleString("pt-BR")}
            </div>
          </div>

          <div className="absolute -top-5 -right-5 hidden rounded-[12px] border border-border bg-white px-4 py-3 shadow-lg sm:block">
            <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              Score de match
            </div>
            <div className="text-[22px] font-extrabold text-[#0F9D6F]">90%</div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
