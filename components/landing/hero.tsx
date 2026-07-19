import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrowserFrame } from "./browser-frame";
import { ScrollReveal } from "./scroll-reveal";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="animate-float-blob pointer-events-none absolute -top-24 -left-32 h-[420px] w-[420px] rounded-full bg-[#2F5FDE]/15 blur-3xl"
      />
      <div
        aria-hidden
        className="animate-float-blob-delayed pointer-events-none absolute -top-10 right-[-10%] h-[380px] w-[380px] rounded-full bg-[#7C5CFC]/15 blur-3xl"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 py-16 lg:py-20">
        <div className="flex max-w-3xl flex-col items-center gap-6 text-center">
          <span className="rounded-full border border-[#DCE3F5] bg-[#F3F6FE] px-3.5 py-1.5 text-[12.5px] font-bold text-primary">
            Acesso antecipado aberto — grátis por enquanto
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            O radar de{" "}
            <span className="bg-gradient-to-r from-[#2F5FDE] to-[#7C5CFC] bg-clip-text text-transparent">
              licitações
            </span>{" "}
            da sua empresa
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            O ProLicita monitora o PNCP automaticamente, usa IA para encontrar
            as licitações compatíveis com o perfil da sua empresa e organiza
            tudo — do primeiro contato até a proposta — num só painel.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/cadastro">
              <Button size="lg">Criar conta grátis</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Já tenho conta
              </Button>
            </Link>
          </div>
        </div>

        <ScrollReveal className="w-full max-w-4xl">
          <BrowserFrame
            src="/screenshots/dashboard.png"
            alt="Visão geral do ProLicita com gráficos de licitações compatíveis, pipeline por etapa e modalidades mais frequentes"
            width={1440}
            height={900}
            priority
          />
        </ScrollReveal>
      </div>
    </section>
  );
}
