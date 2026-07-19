"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const TOOLTIP_STYLE = {
  fontSize: 12.5,
  borderRadius: 10,
  border: "1px solid #E4E7EC",
  boxShadow: "0 6px 16px rgba(22,27,34,0.08)",
};

export function LicitacoesPorDiaChart({
  dados,
}: {
  dados: { dia: string; total: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[15px]">
          Licitações compatíveis por dia
        </CardTitle>
        <CardDescription>Últimos 14 dias</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dados} margin={{ left: -20 }}>
            <CartesianGrid vertical={false} stroke="#EEF0F3" />
            <XAxis
              dataKey="dia"
              tick={{ fontSize: 11, fill: "#8A93A3" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#8A93A3" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "#F5F6F8" }} />
            <Bar dataKey="total" fill="#2F5FDE" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function PipelinePorEtapaChart({
  dados,
}: {
  dados: { etapa: string; total: number; color: string }[];
}) {
  const temDados = dados.some((d) => d.total > 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[15px]">Pipeline por etapa</CardTitle>
        <CardDescription>Oportunidades em cada estágio</CardDescription>
      </CardHeader>
      <CardContent>
        {temDados ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={dados.filter((d) => d.total > 0)}
                dataKey="total"
                nameKey="etapa"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {dados
                  .filter((d) => d.total > 0)
                  .map((d) => (
                    <Cell key={d.etapa} fill={d.color} />
                  ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[220px] items-center justify-center text-[13px] text-muted-foreground">
            Nenhuma oportunidade no pipeline ainda.
          </div>
        )}
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1.5">
          {dados
            .filter((d) => d.total > 0)
            .map((d) => (
              <div key={d.etapa} className="flex items-center gap-1.5 text-[11.5px]">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: d.color }}
                />
                <span className="text-muted-foreground">{d.etapa}</span>
                <span className="font-bold">{d.total}</span>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ModalidadesChart({
  dados,
}: {
  dados: { modalidade: string; total: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[15px]">
          Modalidades mais frequentes
        </CardTitle>
        <CardDescription>Entre as licitações compatíveis</CardDescription>
      </CardHeader>
      <CardContent>
        {dados.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dados} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid horizontal={false} stroke="#EEF0F3" />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#8A93A3" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="modalidade"
                width={140}
                tick={{ fontSize: 11.5, fill: "#565F6B" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "#F5F6F8" }} />
              <Bar dataKey="total" fill="#7C5CFC" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[220px] items-center justify-center text-[13px] text-muted-foreground">
            Sem dados suficientes ainda.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
