import { db } from "@/lib/db";
import { capagMunicipios } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { normalizarMunicipio } from "./normalizar";

export async function buscarCapag(municipio: string | null, uf: string | null) {
  if (!municipio || !uf) return null;
  const [row] = await db
    .select()
    .from(capagMunicipios)
    .where(
      and(
        eq(capagMunicipios.municipioNormalizado, normalizarMunicipio(municipio)),
        eq(capagMunicipios.uf, uf)
      )
    )
    .limit(1);
  return row ?? null;
}
