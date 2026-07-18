import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Image
            src="/logo-prolicita.png"
            alt="ProLicita"
            width={160}
            height={36}
            priority
            className="h-8 w-auto"
          />
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/cadastro">
              <Button>Criar conta</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-4xl flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          O radar de licitações da sua empresa
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          O ProLicita monitora o PNCP automaticamente, encontra as licitações
          compatíveis com o perfil da sua empresa e avisa você pelo painel e
          pelo WhatsApp — com o link do portal e do edital em mãos.
        </p>
        <div className="flex gap-3">
          <Link href="/cadastro">
            <Button size="lg">Começar agora</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Já tenho conta
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
