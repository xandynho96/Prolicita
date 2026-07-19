import { BrowserFrame } from "./browser-frame";
import { ScrollReveal } from "./scroll-reveal";

const BLOCOS = [
  {
    src: "/screenshots/licitacoes.png",
    alt: "Lista de licitações compatíveis com badges de produtos e CAPAG",
    titulo: "Só o que interessa, com o motivo do match",
    descricao:
      "Cada licitação relevante mostra o score de compatibilidade, quais produtos do seu catálogo respondem ao objeto e a justificativa da IA — nada de vasculhar edital por edital pra descobrir se vale a pena.",
  },
  {
    src: "/screenshots/documentos.png",
    alt: "Checklist de documentos de habilitação conforme a Lei 14.133/21",
    titulo: "Checklist de habilitação, não pasta solta",
    descricao:
      "Os documentos de habilitação organizados conforme a Lei 14.133/21, com status de validade e avaliação de conformidade pela IA a cada envio.",
  },
  {
    src: "/screenshots/pipeline.png",
    alt: "Pipeline Kanban de oportunidades por etapa",
    titulo: "Da identificação ao resultado, num quadro só",
    descricao:
      "Arraste os cards entre etapas, adicione prazos e observações — sem depender de planilha paralela pra saber em que pé está cada licitação.",
  },
];

export function ScreenshotShowcase() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-col gap-16">
        {BLOCOS.map((bloco, i) => (
          <ScrollReveal
            key={bloco.titulo}
            className={`flex flex-col items-center gap-10 lg:flex-row ${
              i % 2 === 1 ? "lg:flex-row-reverse" : ""
            }`}
          >
            <div className="w-full lg:w-1/2">
              <BrowserFrame
                src={bloco.src}
                alt={bloco.alt}
                width={1440}
                height={900}
              />
            </div>
            <div className="w-full lg:w-1/2">
              <h3 className="text-[22px] font-extrabold tracking-tight">
                {bloco.titulo}
              </h3>
              <p className="mt-3 text-[14.5px] leading-relaxed text-muted-foreground">
                {bloco.descricao}
              </p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
