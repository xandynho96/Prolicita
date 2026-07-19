import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Cta() {
  return (
    <section className="bg-primary py-16">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 text-center">
        <h2 className="text-[27px] font-extrabold tracking-tight text-primary-foreground">
          Pare de perder licitação por falta de tempo de garimpar o PNCP
        </h2>
        <p className="text-[15px] text-primary-foreground/85">
          Leva menos de 5 minutos para completar o perfil e começar a
          receber os alertas.
        </p>
        <Link href="/cadastro">
          <Button size="lg" variant="secondary">
            Criar conta grátis
          </Button>
        </Link>
      </div>
    </section>
  );
}
