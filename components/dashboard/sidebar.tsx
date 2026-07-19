"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Bell,
  Building2,
  LogOut,
  Kanban,
  CalendarDays,
  FileSignature,
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "Visão geral", icon: LayoutDashboard },
  { href: "/licitacoes", label: "Licitações", icon: FileText },
  { href: "/oportunidades", label: "Pipeline", icon: Kanban },
  { href: "/prazos", label: "Prazos", icon: CalendarDays },
  { href: "/propostas", label: "Propostas", icon: FileSignature },
  { href: "/documentos", label: "Documentos", icon: FolderOpen },
  { href: "/notificacoes", label: "Notificações", icon: Bell },
  { href: "/perfil", label: "Perfil", icon: Building2 },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col overflow-y-auto border-r border-border bg-white px-4.5 py-7 gap-7">
      <Image
        src="/logo-prolicita.png"
        alt="ProLicita"
        width={220}
        height={48}
        priority
        className="h-auto w-full px-1"
      />

      <nav className="flex flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-[9px] px-3.5 py-2.5 text-sm font-semibold transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-secondary-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      <div className="flex items-center gap-2.5 border-t border-[#EEF0F3] pt-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-accent text-xs font-extrabold text-secondary-foreground">
          PL
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 justify-start gap-2 px-2 text-muted-foreground"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
