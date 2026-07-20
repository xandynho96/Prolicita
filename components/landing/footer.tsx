import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Mail } from "lucide-react";

const COLUNAS = [
  {
    titulo: "Produto",
    links: [
      { label: "Recursos", href: "/#recursos" },
      { label: "Como funciona", href: "/#como-funciona" },
      { label: "Planos", href: "/#planos" },
      { label: "Perguntas frequentes", href: "/#faq" },
    ],
  },
  {
    titulo: "Legal",
    links: [
      { label: "Termos de uso", href: "/termos" },
      { label: "Política de privacidade", href: "/privacidade" },
    ],
  },
  {
    titulo: "Conta",
    links: [
      { label: "Entrar", href: "/login" },
      { label: "Criar conta grátis", href: "/cadastro" },
    ],
  },
];

export function LandingFooter() {
  const ano = new Date().getFullYear();
  return (
    <footer className="bg-[#0B1F45] text-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-4">
            <Image
              src="/logo-prolicita-footer.png"
              alt="ProLicita"
              width={547}
              height={267}
              className="h-14 w-[115px] object-contain brightness-0 invert"
            />
            <p className="max-w-[280px] text-[13px] leading-relaxed text-white/60">
              O radar de licitações públicas que monitora o PNCP, avalia
              compatibilidade com IA e organiza tudo do primeiro contato até a
              proposta.
            </p>
            <div className="flex items-center gap-2 text-[13px] text-white/60">
              <MessageCircle className="h-4 w-4" />
              <span>Suporte via WhatsApp</span>
            </div>
            <div className="flex items-center gap-2 text-[13px] text-white/60">
              <Mail className="h-4 w-4" />
              <span>prolicita.ia@gmail.com</span>
            </div>
          </div>

          {COLUNAS.map((coluna) => (
            <div key={coluna.titulo} className="flex flex-col gap-3.5">
              <div className="text-[12.5px] font-bold uppercase tracking-wide text-white/40">
                {coluna.titulo}
              </div>
              {coluna.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[13.5px] text-white/75 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-[12.5px] text-white/45 sm:flex-row">
          <span>© {ano} ProLicita. Todos os direitos reservados.</span>
          <span>Feito para empresas que vendem para o setor público.</span>
        </div>
      </div>
    </footer>
  );
}
