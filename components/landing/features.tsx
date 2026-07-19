import {
  Radar,
  Sparkles,
  Landmark,
  ClipboardCheck,
  Kanban,
  FileText,
  Bell,
  MapPinned,
} from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

const RECURSOS = [
  {
    icon: Radar,
    titulo: "Radar PNCP automático",
    descricao:
      "Sincroniza com o Portal Nacional de Contratações Públicas continuamente, sem precisar acompanhar manualmente.",
  },
  {
    icon: Sparkles,
    titulo: "Matching por IA",
    descricao:
      "A IA lê o objeto de cada licitação e avalia a compatibilidade com o catálogo de produtos/serviços da sua empresa.",
  },
  {
    icon: Landmark,
    titulo: "CAPAG do órgão",
    descricao:
      "Veja a capacidade de pagamento do município antes de decidir participar, com dados do Tesouro Nacional.",
  },
  {
    icon: ClipboardCheck,
    titulo: "Checklist de habilitação",
    descricao:
      "Documentos organizados conforme a Lei 14.133/21, com IA avaliando conformidade de cada envio.",
  },
  {
    icon: Kanban,
    titulo: "Pipeline Kanban",
    descricao:
      "Acompanhe cada oportunidade da identificação até o resultado final, com prazos e responsáveis.",
  },
  {
    icon: FileText,
    titulo: "Propostas geradas por IA",
    descricao:
      "Rascunho técnico/comercial pronto a partir do seu catálogo — revise e exporte em PDF.",
  },
  {
    icon: Bell,
    titulo: "Alertas por painel e WhatsApp",
    descricao:
      "Seja avisado assim que uma licitação compatível for encontrada, sem precisar ficar checando o painel.",
  },
  {
    icon: MapPinned,
    titulo: "Multi-UF e multi-modalidade",
    descricao:
      "Defina a região e as modalidades de contratação de interesse — ou busque o Brasil todo de uma vez.",
  },
];

export function Features() {
  return (
    <section id="recursos" className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-[27px] font-extrabold tracking-tight">
            Tudo o que você precisa num só lugar
          </h2>
          <p className="mt-2.5 text-[15px] text-muted-foreground">
            Da busca à proposta, sem planilha solta nem aba do PNCP aberta o
            dia inteiro.
          </p>
        </ScrollReveal>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {RECURSOS.map((recurso, i) => (
            <ScrollReveal key={recurso.titulo} delayMs={(i % 4) * 80}>
              <div className="flex flex-col gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#2F5FDE] to-[#7C5CFC] text-white">
                  <recurso.icon className="h-5 w-5" />
                </div>
                <div className="text-[14px] font-bold">{recurso.titulo}</div>
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  {recurso.descricao}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
