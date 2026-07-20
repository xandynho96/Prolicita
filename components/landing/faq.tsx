"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

const PERGUNTAS = [
  {
    pergunta: "Preciso pagar para criar minha conta agora?",
    resposta:
      "Não. Estamos em acesso antecipado: sua conta é 100% gratuita enquanto essa fase durar, sem necessidade de cartão de crédito. Se e quando a cobrança for ativada, avisamos com antecedência e você decide se continua.",
  },
  {
    pergunta: "Como funciona o cancelamento?",
    resposta:
      "Não tem fidelidade nem multa. Você pode cancelar quando quiser diretamente pelo painel.",
  },
  {
    pergunta: "Meus dados e documentos da empresa ficam seguros?",
    resposta:
      "Sim. Seguimos a LGPD, os dados trafegam de forma criptografada e você pode consultar todos os detalhes na nossa Política de Privacidade.",
  },
  {
    pergunta: "Funciona para qualquer tipo de empresa?",
    resposta:
      "Sim. O radar é configurado a partir dos CNAEs, palavras-chave e catálogo de produtos/serviços da sua empresa — funciona tanto para quem vende produtos quanto para quem presta serviços.",
  },
  {
    pergunta: "Preciso ficar checando o painel toda hora?",
    resposta:
      "Não. Você recebe alertas automáticos pelo painel, por WhatsApp e por email assim que uma licitação compatível é encontrada.",
  },
  {
    pergunta: "A proposta gerada por IA pode ser enviada direto para o órgão?",
    resposta:
      "Não recomendamos isso. A proposta é um rascunho estruturado para acelerar o trabalho — sempre revise com seu setor técnico/jurídico antes de enviar, já que cada edital pode ter exigências específicas.",
  },
];

export function Faq() {
  const [aberta, setAberta] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-16">
      <ScrollReveal className="text-center">
        <h2 className="text-[27px] font-extrabold tracking-tight">
          Perguntas frequentes
        </h2>
        <p className="mt-2.5 text-[15px] text-muted-foreground">
          Não achou o que procurava? Fale com a gente pelo WhatsApp.
        </p>
      </ScrollReveal>

      <ScrollReveal className="mt-10 flex flex-col divide-y divide-border rounded-[14px] border border-border bg-white shadow-sm">
        {PERGUNTAS.map((item, i) => {
          const aberto = aberta === i;
          return (
            <div key={item.pergunta}>
              <button
                type="button"
                onClick={() => setAberta(aberto ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-6 py-4.5 text-left"
              >
                <span className="text-[14.5px] font-bold">{item.pergunta}</span>
                <ChevronDown
                  className={`h-4.5 w-4.5 shrink-0 text-muted-foreground transition-transform duration-300 ${
                    aberto ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ease-out ${
                  aberto ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-4.5 text-[13.5px] leading-relaxed text-muted-foreground">
                    {item.resposta}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </ScrollReveal>
    </section>
  );
}
