import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrowserFrame } from "./browser-frame";

export function Hero() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 py-16 lg:py-20">
      <div className="flex max-w-3xl flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          O radar de licitações da sua empresa
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

      <div className="w-full max-w-4xl">
        <BrowserFrame
          src="/screenshots/dashboard.png"
          alt="Visão geral do ProLicita com gráficos de licitações compatíveis, pipeline por etapa e modalidades mais frequentes"
          width={1440}
          height={900}
          priority
        />
      </div>
    </section>
  );
}
