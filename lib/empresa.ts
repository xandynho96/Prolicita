import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { empresas } from "@/lib/db/schema";

/**
 * MVP: cada usuário tem uma única empresa. Retorna a primeira encontrada.
 */
export async function getEmpresaDoUsuario(userId: string) {
  const [empresa] = await db
    .select()
    .from(empresas)
    .where(eq(empresas.userId, userId))
    .limit(1);

  return empresa ?? null;
}

/**
 * Escopo de busca no PNCP para uma empresa: UFs a filtrar (`undefined` =
 * Brasil todo, sem filtro) e modalidades a filtrar (`undefined` = todas).
 */
export function getEscopoBusca(empresa: typeof empresas.$inferSelect) {
  const ufs = empresa.buscarBrasilTodo
    ? undefined
    : empresa.ufsBusca.length > 0
      ? empresa.ufsBusca
      : empresa.uf
        ? [empresa.uf]
        : undefined;

  const modalidades =
    empresa.modalidades.length > 0 ? empresa.modalidades : undefined;

  return { ufs, modalidades };
}
