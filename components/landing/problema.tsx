import { Clock, TriangleAlert, Target } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

const PROBLEMAS = [
  {
    icon: Clock,
    titulo: "Horas desperdiçadas",
    descricao:
      "Busca manual no PNCP todos os dias, consumindo tempo precioso da equipe comercial.",
  },
  {
    icon: TriangleAlert,
    titulo: "Oportunidades perdidas",
    descricao:
      "Licitações relevantes passam despercebidas pela falta de monitoramento contínuo.",
  },
  {
    icon: Target,
    titulo: "Análise imprecisa",
    descricao:
      "Dificuldade em avaliar rapidamente se um edital realmente vale a pena para a sua empresa.",
  },
];

export function Problema() {
  return (
    <section className="bg-[#F9FAFB] py-16">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <span className="text-[12.5px] font-bold uppercase tracking-wide text-[#0EA5C4]">
            O problema
          </span>
          <h2 className="mt-2 text-[27px] font-extrabold tracking-tight text-[#101828]">
            Oportunidades perdidas todos os dias
          </h2>
          <p className="mt-2.5 text-[15px] text-muted-foreground">
            Empresas que vendem para o governo enfrentam desafios constantes
            na busca e análise de editais.
          </p>
        </ScrollReveal>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {PROBLEMAS.map((problema, i) => (
            <ScrollReveal key={problema.titulo} delayMs={i * 100}>
              <div className="flex h-full flex-col gap-3 rounded-[14px] border border-border bg-white p-6 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#FBE7E7] text-[#B23A3A]">
                  <problema.icon className="h-5 w-5" />
                </div>
                <div className="text-[14.5px] font-bold text-[#101828]">
                  {problema.titulo}
                </div>
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  {problema.descricao}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
