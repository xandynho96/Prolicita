import { ScrollReveal } from "./scroll-reveal";

export function StatsBar({
  totalLicitacoes,
  totalMunicipiosCapag,
  totalModalidades,
}: {
  totalLicitacoes: number;
  totalMunicipiosCapag: number;
  totalModalidades: number;
}) {
  const stats = [
    {
      valor: `+${totalLicitacoes.toLocaleString("pt-BR")}`,
      label: "Licitações monitoradas",
    },
    {
      valor: totalMunicipiosCapag.toLocaleString("pt-BR"),
      label: "Municípios com dados de CAPAG",
    },
    { valor: String(totalModalidades), label: "Modalidades de contratação" },
    { valor: "100%", label: "Gratuito no acesso antecipado" },
  ];

  return (
    <section className="bg-[#0F9D6F] py-10">
      <ScrollReveal className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-[28px] font-extrabold text-white sm:text-[32px]">
              {stat.valor}
            </div>
            <div className="mt-1 text-[12.5px] text-white/85">{stat.label}</div>
          </div>
        ))}
      </ScrollReveal>
    </section>
  );
}
