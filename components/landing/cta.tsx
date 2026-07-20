import Link from "next/link";
import { ShieldCheck, MessageCircle, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "./scroll-reveal";

const GARANTIAS = [
  { icon: Ban, texto: "Sem cartão de crédito" },
  { icon: ShieldCheck, texto: "Cancele quando quiser" },
  { icon: MessageCircle, texto: "Suporte direto pelo WhatsApp" },
];

export function Cta() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0C7F59] via-[#0F9D6F] to-[#14B8A6] py-20">
      <div
        aria-hidden
        className="animate-float-blob pointer-events-none absolute -top-20 left-[-8%] h-[320px] w-[320px] rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden
        className="animate-float-blob-delayed pointer-events-none absolute bottom-[-15%] right-[-5%] h-[360px] w-[360px] rounded-full bg-white/10 blur-3xl"
      />

      <ScrollReveal className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 text-center">
        <h2 className="text-[30px] font-extrabold tracking-tight text-white sm:text-[34px]">
          Comece a encontrar as licitações certas hoje
        </h2>
        <p className="text-[15.5px] text-white/85">
          Leva menos de 5 minutos para completar o perfil e começar a receber
          os alertas — de graça, enquanto durar o acesso antecipado.
        </p>
        <Link href="/cadastro">
          <Button size="lg" variant="secondary" className="px-8">
            Criar conta grátis
          </Button>
        </Link>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
          {GARANTIAS.map((g) => (
            <div
              key={g.texto}
              className="flex items-center gap-2 text-[13px] font-medium text-white/85"
            >
              <g.icon className="h-4 w-4" />
              {g.texto}
            </div>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
