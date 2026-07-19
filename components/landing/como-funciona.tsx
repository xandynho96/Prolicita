import { ClipboardList, Radar, Kanban, FileText } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

const PASSOS = [
  {
    icon: ClipboardList,
    titulo: "1. Complete o perfil",
    descricao:
      "CNAEs, palavras-chave, região de busca e o catálogo de produtos/serviços que sua empresa oferece.",
  },
  {
    icon: Radar,
    titulo: "2. O radar trabalha por você",
    descricao:
      "Sincroniza com o PNCP e usa IA para avaliar cada licitação publicada contra o seu perfil.",
  },
  {
    icon: Kanban,
    titulo: "3. Acompanhe no pipeline",
    descricao:
      "Cada oportunidade relevante vira um card — mova entre etapas, adicione prazos e observações.",
  },
  {
    icon: FileText,
    titulo: "4. Gere a proposta",
    descricao:
      "A IA monta um rascunho de proposta técnica/comercial a partir do seu catálogo — pronto para revisar e exportar em PDF.",
  },
];

export function ComoFunciona() {
  return (
    <section id="como-funciona" className="mx-auto max-w-6xl px-6 py-16">
      <ScrollReveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-[27px] font-extrabold tracking-tight">
          Como funciona
        </h2>
        <p className="mt-2.5 text-[15px] text-muted-foreground">
          Do cadastro à proposta pronta, sem precisar acompanhar o PNCP na
          mão.
        </p>
      </ScrollReveal>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PASSOS.map((passo, i) => (
          <ScrollReveal key={passo.titulo} delayMs={i * 100}>
            <div className="flex h-full flex-col gap-3 rounded-[14px] border border-border bg-white p-5 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#2F5FDE] to-[#7C5CFC] text-white">
                <passo.icon className="h-5 w-5" />
              </div>
              <div className="text-[14.5px] font-bold">{passo.titulo}</div>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {passo.descricao}
              </p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
