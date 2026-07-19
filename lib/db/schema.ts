import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  numeric,
  integer,
  boolean,
  date,
  unique,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const matchStatusEnum = pgEnum("match_status", [
  "pendente",
  "relevante",
  "descartado",
]);

export const notificacaoCanalEnum = pgEnum("notificacao_canal", [
  "painel",
  "whatsapp",
]);

export const notificacaoStatusEnum = pgEnum("notificacao_status", [
  "enviado",
  "erro",
]);

export const documentoCategoriaEnum = pgEnum("documento_categoria", [
  "juridico",
  "fiscal",
  "tecnico",
  "propostas",
  "editais",
]);

export const documentoStatusEnum = pgEnum("documento_status", [
  "valido",
  "vencendo",
  "vencido",
  "pendente",
]);

export const oportunidadeEtapaEnum = pgEnum("oportunidade_etapa", [
  "identificada",
  "em_analise",
  "proposta_enviada",
  "aguardando_resultado",
  "ganha",
  "perdida",
]);

export const prazoTipoEnum = pgEnum("prazo_tipo", [
  "sessao",
  "impugnacao",
  "recurso",
  "entrega_documentos",
  "outro",
]);

export const propostaStatusEnum = pgEnum("proposta_status", [
  "rascunho",
  "finalizada",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  // Nulo para contas criadas via login social (ex.: Google), que não têm senha.
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const empresas = pgTable("empresas", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  razaoSocial: text("razao_social").notNull(),
  cnpj: text("cnpj").notNull(),
  cnaes: jsonb("cnaes").$type<string[]>().notNull().default([]),
  palavrasChave: jsonb("palavras_chave")
    .$type<string[]>()
    .notNull()
    .default([]),
  uf: text("uf"),
  municipio: text("municipio"),
  logradouro: text("logradouro"),
  numero: text("numero"),
  bairro: text("bairro"),
  cep: text("cep"),
  descricaoPerfil: text("descricao_perfil"),
  nomeFantasia: text("nome_fantasia"),
  telefone: text("telefone"),
  email: text("email"),
  site: text("site"),
  segmento: text("segmento"),
  porte: text("porte"),
  valorMinimo: numeric("valor_minimo", { precision: 18, scale: 2 }),
  valorMaximo: numeric("valor_maximo", { precision: 18, scale: 2 }),
  ufsBusca: jsonb("ufs_busca").$type<string[]>().notNull().default([]),
  buscarBrasilTodo: boolean("buscar_brasil_todo").notNull().default(false),
  modalidades: jsonb("modalidades").$type<number[]>().notNull().default([]),
  contatosWhatsapp: jsonb("contatos_whatsapp")
    .$type<{ nome: string; numero: string }[]>()
    .notNull()
    .default([]),
  representanteLegalNome: text("representante_legal_nome"),
  representanteLegalCpf: text("representante_legal_cpf"),
  representanteLegalCargo: text("representante_legal_cargo"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const produtosServicos = pgTable("produtos_servicos", {
  id: uuid("id").primaryKey().defaultRandom(),
  empresaId: uuid("empresa_id")
    .notNull()
    .references(() => empresas.id, { onDelete: "cascade" }),
  nome: text("nome").notNull(),
  descricaoResumida: text("descricao_resumida").notNull(),
  descricaoDetalhada: text("descricao_detalhada"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const licitacoes = pgTable("licitacoes", {
  id: uuid("id").primaryKey().defaultRandom(),
  pncpId: text("pncp_id").notNull().unique(),
  orgaoNome: text("orgao_nome").notNull(),
  orgaoCnpj: text("orgao_cnpj").notNull(),
  objeto: text("objeto").notNull(),
  modalidade: text("modalidade"),
  modalidadeId: integer("modalidade_id"),
  uf: text("uf"),
  municipio: text("municipio"),
  valorEstimado: numeric("valor_estimado", { precision: 18, scale: 2 }),
  dataPublicacao: date("data_publicacao"),
  dataAberturaProposta: timestamp("data_abertura_proposta", {
    withTimezone: true,
  }),
  linkPortal: text("link_portal"),
  linkEdital: text("link_edital"),
  rawJson: jsonb("raw_json"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const empresaLicitacaoMatches = pgTable(
  "empresa_licitacao_matches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    empresaId: uuid("empresa_id")
      .notNull()
      .references(() => empresas.id, { onDelete: "cascade" }),
    licitacaoId: uuid("licitacao_id")
      .notNull()
      .references(() => licitacoes.id, { onDelete: "cascade" }),
    matchScore: numeric("match_score", { precision: 5, scale: 2 }),
    matchReason: text("match_reason"),
    status: matchStatusEnum("status").notNull().default("pendente"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [unique().on(table.empresaId, table.licitacaoId)]
);

export const notificacoes = pgTable("notificacoes", {
  id: uuid("id").primaryKey().defaultRandom(),
  empresaId: uuid("empresa_id")
    .notNull()
    .references(() => empresas.id, { onDelete: "cascade" }),
  licitacaoId: uuid("licitacao_id")
    .notNull()
    .references(() => licitacoes.id, { onDelete: "cascade" }),
  canal: notificacaoCanalEnum("canal").notNull(),
  status: notificacaoStatusEnum("status").notNull(),
  mensagem: text("mensagem").notNull(),
  enviadoEm: timestamp("enviado_em", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const documentos = pgTable("documentos", {
  id: uuid("id").primaryKey().defaultRandom(),
  empresaId: uuid("empresa_id")
    .notNull()
    .references(() => empresas.id, { onDelete: "cascade" }),
  categoria: documentoCategoriaEnum("categoria").notNull(),
  nome: text("nome").notNull(),
  numeroIdentificacao: text("numero_identificacao"),
  dataValidade: date("data_validade"),
  semVencimento: boolean("sem_vencimento").notNull().default(false),
  status: documentoStatusEnum("status").notNull().default("pendente"),
  textoExtraido: text("texto_extraido"),
  aiResumo: text("ai_resumo"),
  aiPendencias: jsonb("ai_pendencias").$type<string[]>().notNull().default([]),
  aiSugestoes: jsonb("ai_sugestoes").$type<string[]>().notNull().default([]),
  licitacaoVinculadaId: uuid("licitacao_vinculada_id").references(
    () => licitacoes.id,
    { onDelete: "set null" }
  ),
  aiComparacaoEdital: jsonb("ai_comparacao_edital")
    .$type<{ requisito: string; atende: boolean; obs: string }[]>()
    .default([]),
  arquivoBase64: text("arquivo_base64"),
  arquivoMime: text("arquivo_mime"),
  arquivoNomeOriginal: text("arquivo_nome_original"),
  arquivoTamanho: integer("arquivo_tamanho"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const documentosRelations = relations(documentos, ({ one }) => ({
  empresa: one(empresas, {
    fields: [documentos.empresaId],
    references: [empresas.id],
  }),
  licitacaoVinculada: one(licitacoes, {
    fields: [documentos.licitacaoVinculadaId],
    references: [licitacoes.id],
  }),
}));

export const oportunidades = pgTable(
  "oportunidades",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    empresaId: uuid("empresa_id")
      .notNull()
      .references(() => empresas.id, { onDelete: "cascade" }),
    licitacaoId: uuid("licitacao_id")
      .notNull()
      .references(() => licitacoes.id, { onDelete: "cascade" }),
    etapa: oportunidadeEtapaEnum("etapa").notNull().default("identificada"),
    responsavel: text("responsavel"),
    valorProposta: numeric("valor_proposta", { precision: 18, scale: 2 }),
    observacoes: text("observacoes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [unique().on(table.empresaId, table.licitacaoId)]
);

export const prazos = pgTable("prazos", {
  id: uuid("id").primaryKey().defaultRandom(),
  empresaId: uuid("empresa_id")
    .notNull()
    .references(() => empresas.id, { onDelete: "cascade" }),
  oportunidadeId: uuid("oportunidade_id").references(() => oportunidades.id, {
    onDelete: "cascade",
  }),
  licitacaoId: uuid("licitacao_id").references(() => licitacoes.id, {
    onDelete: "set null",
  }),
  titulo: text("titulo").notNull(),
  tipo: prazoTipoEnum("tipo").notNull().default("outro"),
  data: timestamp("data", { withTimezone: true }).notNull(),
  concluido: boolean("concluido").notNull().default(false),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const propostas = pgTable(
  "propostas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    empresaId: uuid("empresa_id")
      .notNull()
      .references(() => empresas.id, { onDelete: "cascade" }),
    licitacaoId: uuid("licitacao_id")
      .notNull()
      .references(() => licitacoes.id, { onDelete: "cascade" }),
    oportunidadeId: uuid("oportunidade_id").references(
      () => oportunidades.id,
      { onDelete: "set null" }
    ),
    status: propostaStatusEnum("status").notNull().default("rascunho"),
    produtosSelecionadosIds: jsonb("produtos_selecionados_ids")
      .$type<string[]>()
      .notNull()
      .default([]),
    apresentacaoEmpresa: text("apresentacao_empresa"),
    objetoOfertado: text("objeto_ofertado"),
    especificacaoTecnica: text("especificacao_tecnica"),
    cronogramaImplantacao: text("cronograma_implantacao"),
    valorTotal: numeric("valor_total", { precision: 18, scale: 2 }),
    detalhamentoValor: text("detalhamento_valor"),
    prazoValidadeDias: integer("prazo_validade_dias").notNull().default(60),
    prazoExecucaoDias: integer("prazo_execucao_dias"),
    declaracoes: text("declaracoes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [unique().on(table.empresaId, table.licitacaoId)]
);

export const produtosServicosRelations = relations(
  produtosServicos,
  ({ one }) => ({
    empresa: one(empresas, {
      fields: [produtosServicos.empresaId],
      references: [empresas.id],
    }),
  })
);

export const propostasRelations = relations(propostas, ({ one }) => ({
  empresa: one(empresas, {
    fields: [propostas.empresaId],
    references: [empresas.id],
  }),
  licitacao: one(licitacoes, {
    fields: [propostas.licitacaoId],
    references: [licitacoes.id],
  }),
  oportunidade: one(oportunidades, {
    fields: [propostas.oportunidadeId],
    references: [oportunidades.id],
  }),
}));

export const oportunidadesRelations = relations(
  oportunidades,
  ({ one, many }) => ({
    empresa: one(empresas, {
      fields: [oportunidades.empresaId],
      references: [empresas.id],
    }),
    licitacao: one(licitacoes, {
      fields: [oportunidades.licitacaoId],
      references: [licitacoes.id],
    }),
    prazos: many(prazos),
  })
);

export const prazosRelations = relations(prazos, ({ one }) => ({
  empresa: one(empresas, {
    fields: [prazos.empresaId],
    references: [empresas.id],
  }),
  oportunidade: one(oportunidades, {
    fields: [prazos.oportunidadeId],
    references: [oportunidades.id],
  }),
  licitacao: one(licitacoes, {
    fields: [prazos.licitacaoId],
    references: [licitacoes.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  empresas: many(empresas),
}));

export const empresasRelations = relations(empresas, ({ one, many }) => ({
  user: one(users, { fields: [empresas.userId], references: [users.id] }),
  matches: many(empresaLicitacaoMatches),
  notificacoes: many(notificacoes),
  documentos: many(documentos),
  oportunidades: many(oportunidades),
  prazos: many(prazos),
  produtosServicos: many(produtosServicos),
  propostas: many(propostas),
}));

export const licitacoesRelations = relations(licitacoes, ({ many }) => ({
  matches: many(empresaLicitacaoMatches),
  notificacoes: many(notificacoes),
}));

export const empresaLicitacaoMatchesRelations = relations(
  empresaLicitacaoMatches,
  ({ one }) => ({
    empresa: one(empresas, {
      fields: [empresaLicitacaoMatches.empresaId],
      references: [empresas.id],
    }),
    licitacao: one(licitacoes, {
      fields: [empresaLicitacaoMatches.licitacaoId],
      references: [licitacoes.id],
    }),
  })
);

export const notificacoesRelations = relations(notificacoes, ({ one }) => ({
  empresa: one(empresas, {
    fields: [notificacoes.empresaId],
    references: [empresas.id],
  }),
  licitacao: one(licitacoes, {
    fields: [notificacoes.licitacaoId],
    references: [licitacoes.id],
  }),
}));
