import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { Hero } from "@/components/landing/hero";
import { ComoFunciona } from "@/components/landing/como-funciona";
import { Features } from "@/components/landing/features";
import { ScreenshotShowcase } from "@/components/landing/screenshot-showcase";
import { Pricing } from "@/components/landing/pricing";
import { Cta } from "@/components/landing/cta";
import { LandingFooter } from "@/components/landing/footer";

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Image
            src="/logo-prolicita.png"
            alt="ProLicita"
            width={220}
            height={71}
            priority
            className="h-11 w-auto"
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

      <main className="flex-1">
        <Hero />
        <ComoFunciona />
        <Features />
        <ScreenshotShowcase />
        <Pricing />
        <Cta />
      </main>

      <LandingFooter />
    </div>
  );
}
