import { and, desc, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { empresas, licitacoes, notificacoes } from "@/lib/db/schema";
import { enviarWhatsapp } from "./whatsapp";

/**
 * Intervalo mínimo entre resumos de WhatsApp para a mesma empresa, mesmo
 * que o cron e uma busca manual rodem próximos um do outro. Reduz a
 * frequência de envios automatizados — um dos fatores que o WhatsApp usa
 * para sinalizar contas Business como comportamento de bot.
 */
const INTERVALO_MINIMO_HORAS = 3;

async function envioRecenteDemais(empresaId: string): Promise<boolean> {
  const desde = new Date();
  desde.setHours(desde.getHours() - INTERVALO_MINIMO_HORAS);

  const [ultimo] = await db
    .select({ enviadoEm: notificacoes.enviadoEm })
    .from(notificacoes)
    .where(
      and(
        eq(notificacoes.empresaId, empresaId),
        eq(notificacoes.canal, "whatsapp"),
        eq(notificacoes.status, "enviado"),
        gte(notificacoes.enviadoEm, desde)
      )
    )
    .orderBy(desc(notificacoes.enviadoEm))
    .limit(1);

  return !!ultimo;
}

function formatarValor(valor: string | null): string {
  if (!valor) return "não informado";
  const num = Number(valor);
  if (Number.isNaN(num)) return "não informado";
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function montarMensagem(
  empresa: typeof empresas.$inferSelect,
  licitacao: typeof licitacoes.$inferSelect,
  motivo: string
): string {
  const cidade = [licitacao.municipio, licitacao.uf].filter(Boolean).join("/");

  const linhas = [
    `Nova licitação compatível com o perfil de ${empresa.razaoSocial}`,
    "",
    `Órgão: ${licitacao.orgaoNome}`,
    `Objeto: ${licitacao.objeto}`,
    `Modalidade: ${licitacao.modalidade ?? "não informado"}`,
    `Cidade: ${cidade || "não informado"}`,
    `Valor estimado: ${formatarValor(licitacao.valorEstimado)}`,
    `Motivo do match: ${motivo}`,
    "",
    `Portal: ${licitacao.linkPortal}`,
  ];

  if (licitacao.linkEdital) {
    linhas.push(`Edital: ${licitacao.linkEdital}`);
  }

  return linhas.join("\n");
}

/**
 * Registra a notificação de um match no painel (histórico interno). Não
 * dispara WhatsApp — o envio por WhatsApp é agrupado em um resumo único por
 * execução (ver `enviarResumoWhatsapp`), para não gerar rajadas de mensagens
 * que acionam a detecção de spam/automação do WhatsApp.
 */
export async function registrarNotificacaoPainel(
  empresa: typeof empresas.$inferSelect,
  licitacao: typeof licitacoes.$inferSelect,
  motivo: string
): Promise<void> {
  const mensagem = montarMensagem(empresa, licitacao, motivo);

  await db.insert(notificacoes).values({
    empresaId: empresa.id,
    licitacaoId: licitacao.id,
    canal: "painel",
    status: "enviado",
    mensagem,
  });
}

function truncar(texto: string, max: number): string {
  return texto.length > max ? `${texto.slice(0, max - 1)}…` : texto;
}

function montarResumo(
  empresa: typeof empresas.$inferSelect,
  itens: { licitacao: typeof licitacoes.$inferSelect; motivo: string }[]
): string {
  const linhas = [
    `📋 Radar ProLicita — ${itens.length} nova(s) licitação(ões) compatível(eis) com o perfil de ${empresa.razaoSocial}`,
    "",
  ];

  itens.forEach(({ licitacao }, i) => {
    const cidade = [licitacao.municipio, licitacao.uf].filter(Boolean).join("/");
    linhas.push(
      `${i + 1}. ${licitacao.orgaoNome}${cidade ? ` (${cidade})` : ""}`,
      truncar(licitacao.objeto, 160),
      `Valor: ${formatarValor(licitacao.valorEstimado)} · ${licitacao.modalidade ?? "modalidade não informada"}`,
      `Portal: ${licitacao.linkPortal}`,
      ""
    );
  });

  linhas.push("Veja os detalhes completos no painel do ProLicita.");

  return linhas.join("\n");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Atraso aleatório entre envios para não parecer disparo automatizado em massa. */
function delayHumano(): Promise<void> {
  const ms = 4000 + Math.floor(Math.random() * 6000);
  return sleep(ms);
}

/**
 * Envia UM resumo por contato de WhatsApp da empresa, agrupando todos os
 * matches relevantes encontrados numa mesma execução de busca/matching.
 * Evita o padrão de rajada (várias mensagens quase idênticas em segundos)
 * que faz o WhatsApp restringir números de contas Business. Respeita o
 * toggle `whatsappAtivo` (pausa manual pelo usuário) e um intervalo
 * mínimo entre envios, mesmo que cron e busca manual coincidam.
 */
export async function enviarResumoWhatsapp(
  empresa: typeof empresas.$inferSelect,
  itens: { licitacao: typeof licitacoes.$inferSelect; motivo: string }[]
): Promise<void> {
  if (itens.length === 0 || empresa.contatosWhatsapp.length === 0) return;
  if (!empresa.whatsappAtivo) return;
  if (await envioRecenteDemais(empresa.id)) return;

  const mensagem = montarResumo(empresa, itens);

  for (const [i, contato] of empresa.contatosWhatsapp.entries()) {
    if (i > 0) await delayHumano();

    try {
      await enviarWhatsapp(contato.numero, mensagem);
      await db.insert(notificacoes).values({
        empresaId: empresa.id,
        licitacaoId: itens[0].licitacao.id,
        canal: "whatsapp",
        status: "enviado",
        mensagem: `Resumo para ${contato.nome} (${contato.numero}) — ${itens.length} licitação(ões):\n\n${mensagem}`,
      });
    } catch (err) {
      console.error(
        `Falha ao enviar resumo WhatsApp para empresa=${empresa.id} contato=${contato.nome}:`,
        err
      );
      await db.insert(notificacoes).values({
        empresaId: empresa.id,
        licitacaoId: itens[0].licitacao.id,
        canal: "whatsapp",
        status: "erro",
        mensagem: `Erro ao enviar resumo para ${contato.nome} (${contato.numero}): ${
          err instanceof Error ? err.message : String(err)
        }`,
      });
    }
  }
}
