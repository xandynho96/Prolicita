import Image from "next/image";
import Link from "next/link";

export function LandingFooter() {
  const ano = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <Image
          src="/logo-prolicita.png"
          alt="ProLicita"
          width={140}
          height={32}
          className="h-7 w-auto"
        />
        <div className="flex items-center gap-5 text-[13px] text-muted-foreground">
          <Link href="/login" className="hover:text-foreground">
            Entrar
          </Link>
          <Link href="/cadastro" className="hover:text-foreground">
            Criar conta
          </Link>
          <span>© {ano} ProLicita</span>
        </div>
      </div>
    </footer>
  );
}
