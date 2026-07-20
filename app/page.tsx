import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { sql } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { licitacoes, capagMunicipios } from "@/lib/db/schema";
import { MODALIDADES_CONTRATACAO } from "@/lib/pncp/types";
import { Hero } from "@/components/landing/hero";
import { StatsBar } from "@/components/landing/stats-bar";
import { Problema } from "@/components/landing/problema";
import { ComoFunciona } from "@/components/landing/como-funciona";
import { Features } from "@/components/landing/features";
import { ScreenshotShowcase } from "@/components/landing/screenshot-showcase";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { Cta } from "@/components/landing/cta";
import { LandingFooter } from "@/components/landing/footer";

const NAV_LINKS = [
  { label: "Recursos", href: "#recursos" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Planos", href: "#planos" },
  { label: "FAQ", href: "#faq" },
];

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  const [[{ count: totalLicitacoes }], [{ count: totalMunicipiosCapag }]] =
    await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(licitacoes),
      db.select({ count: sql<number>`count(*)::int` }).from(capagMunicipios),
    ]);

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Image
            src="/logo-prolicita.png"
            alt="ProLicita"
            width={280}
            height={90}
            priority
            className="h-14 w-auto"
          />
          <nav className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[13.5px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/cadastro">
              <Button className="bg-[#0EA5C4] text-white hover:bg-[#0B87A3]">
                Criar conta
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Hero totalLicitacoes={totalLicitacoes} />
        <StatsBar
          totalLicitacoes={totalLicitacoes}
          totalMunicipiosCapag={totalMunicipiosCapag}
          totalModalidades={Object.keys(MODALIDADES_CONTRATACAO).length}
        />
        <Problema />
        <ComoFunciona />
        <Features />
        <ScreenshotShowcase />
        <Pricing />
        <Faq />
        <Cta />
      </main>

      <LandingFooter />
    </div>
  );
}
