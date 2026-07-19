import Image from "next/image";
import Link from "next/link";
import { LandingFooter } from "./footer";

export function LegalPage({
  titulo,
  atualizadoEm,
  children,
}: {
  titulo: string;
  atualizadoEm: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/">
            <Image
              src="/logo-prolicita.png"
              alt="ProLicita"
              width={220}
              height={71}
              className="h-10 w-auto"
            />
          </Link>
          <Link
            href="/"
            className="text-[13px] font-bold text-muted-foreground hover:text-foreground"
          >
            ← Voltar
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-14">
        <h1 className="text-[27px] font-extrabold tracking-tight">{titulo}</h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          Última atualização: {atualizadoEm}
        </p>
        <div className="prose-legal mt-8 flex flex-col gap-5 text-[14px] leading-relaxed text-foreground">
          {children}
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
