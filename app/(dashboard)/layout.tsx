import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex h-svh overflow-hidden">
      <DashboardSidebar />
      <main className="h-full flex-1 overflow-y-auto bg-background">
        <div className="mx-auto max-w-[1320px] px-11 py-9">{children}</div>
      </main>
    </div>
  );
}
