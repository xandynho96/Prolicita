import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  empresaLicitacaoMatches,
  empresas,
  licitacoes,
  produtosServicos,
  users,
} from "@/lib/db/schema";
import { passaFiltroPreliminar } from "./keyword-filter";
import { avaliarMatchIA } from "./ai-match";
import {
  enviarResumoEmail,
  enviarResumoWhatsapp,
  registrarNotificacaoPainel,
} from "@/lib/notifications/notify";
import { garantirLinkEdital } from "@/lib/pncp/sync";
import { criarOportunidadeAutomatica } from "@/lib/oportunidades/criar";

const LIMITE_CANDIDATOS_POR_EMPRESA = 300;

async function buscarCandidatosSemMatch(empresaId: string) {
  const linhas = await db
    .select({ licitacao: licitacoes })
    .from(licitacoes)
    .leftJoin(
      empresaLicitacaoMatches,
      and(
        eq(empresaLicitacaoMatches.licitacaoId, licitacoes.id),
        eq(empresaLicitacaoMatches.empresaId, empresaId)
      )
    )
    .where(isNull(empresaLicitacaoMatches.id))
    .orderBy(desc(licitacoes.createdAt))
    .limit(LIMITE_CANDIDATOS_POR_EMPRESA);

  return linhas.map((l) => l.licitacao);
}

async function processarEmpresa(
  empresa: typeof empresas.$inferSelect,
  userEmail: string | null
) {
  const [candidatos, produtos] = await Promise.all([
    buscarCandidatosSemMatch(empresa.id),
    db
      .select()
      .from(produtosServicos)
      .where(eq(produtosServicos.empresaId, empresa.id)),
  ]);
  const preFiltrados = candidatos.filter((lic) =>
    passaFiltroPreliminar(empresa, lic, produtos)
  );

  const matchesEncontrados: {
    licitacao: typeof licitacoes.$inferSelect;
    motivo: string;
  }[] = [];

  for (const licitacao of preFiltrados) {
    try {
      const avaliacao = await avaliarMatchIA({
        descricaoPerfil: empresa.descricaoPerfil,
        palavrasChave: empresa.palavrasChave,
        cnaes: empresa.cnaes,
        produtos: produtos.map((p) => ({
          nome: p.nome,
          descricaoResumida: p.descricaoResumida,
        })),
        valorMinimo: empresa.valorMinimo,
        valorMaximo: empresa.valorMaximo,
        objetoLicitacao: licitacao.objeto,
        valorEstimadoLicitacao: licitacao.valorEstimado,
        modalidade: licitacao.modalidade,
        orgaoNome: licitacao.orgaoNome,
      });

      await db.insert(empresaLicitacaoMatches).values({
        empresaId: empresa.id,
        licitacaoId: licitacao.id,
        matchScore: String(avaliacao.score),
        matchReason: avaliacao.motivo,
        status: avaliacao.match ? "relevante" : "descartado",
      });

      if (avaliacao.match) {
        const linkEdital = await garantirLinkEdital(licitacao).catch(
          () => undefined
        );
        const licitacaoAtualizada = linkEdital
          ? { ...licitacao, linkEdital }
          : licitacao;
        await registrarNotificacaoPainel(
          empresa,
          licitacaoAtualizada,
          avaliacao.motivo
        );
        await criarOportunidadeAutomatica(empresa, licitacaoAtualizada);
        matchesEncontrados.push({
          licitacao: licitacaoAtualizada,
          motivo: avaliacao.motivo,
        });
      }
    } catch (err) {
      console.error(
        `Falha ao avaliar match empresa=${empresa.id} licitacao=${licitacao.id}:`,
        err
      );
    }
  }

  await enviarResumoWhatsapp(empresa, matchesEncontrados);
  await enviarResumoEmail(empresa, userEmail, matchesEncontrados);

  return {
    avaliadas: preFiltrados.length,
    matches: matchesEncontrados.length,
  };
}

/**
 * Roda o pipeline de matching (filtro + IA + notificação) para uma empresa
 * específica, ou para todas as empresas cadastradas.
 */
export async function executarMatching(options?: { empresaId?: string }) {
  const query = db
    .select({ empresa: empresas, userEmail: users.email })
    .from(empresas)
    .innerJoin(users, eq(users.id, empresas.userId));

  const listaEmpresas = options?.empresaId
    ? await query.where(eq(empresas.id, options.empresaId))
    : await query;

  let totalAvaliadas = 0;
  let totalMatches = 0;

  for (const { empresa, userEmail } of listaEmpresas) {
    const resultado = await processarEmpresa(empresa, userEmail);
    totalAvaliadas += resultado.avaliadas;
    totalMatches += resultado.matches;
  }

  return {
    empresasProcessadas: listaEmpresas.length,
    avaliadas: totalAvaliadas,
    matches: totalMatches,
  };
}
