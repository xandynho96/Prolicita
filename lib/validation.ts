import { z } from "zod";
import { LIMITES } from "@/lib/security/limits";

const texto = (max: number) => z.string().max(max);
const textoOpcional = (max: number) => z.string().max(max).optional();
const arrayTexto = (maxItens: number, maxTamanhoItem: number) =>
  z.array(z.string().max(maxTamanhoItem)).max(maxItens);

export const cadastroSchema = z.object({
  name: texto(LIMITES.TEXTO_CURTO).min(2, "Informe seu nome"),
  email: z.string().email("Email inválido").max(LIMITES.TEXTO_CURTO),
  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .max(72, "A senha deve ter no máximo 72 caracteres"),
});

export const contatoWhatsappSchema = z.object({
  nome: texto(LIMITES.TEXTO_CURTO).min(1, "Informe o nome do contato"),
  numero: z
    .string()
    .min(8, "Número inválido")
    .max(20, "Número inválido")
    .transform((v) => v.replace(/\D/g, "")),
});

export const empresaSchema = z.object({
  razaoSocial: texto(LIMITES.TEXTO_CURTO).min(2, "Informe a razão social"),
  cnpj: z
    .string()
    .min(14, "CNPJ inválido")
    .max(18, "CNPJ inválido")
    .transform((v) => v.replace(/\D/g, "")),
  cnaes: arrayTexto(LIMITES.ARRAY_PEQUENO, 20),
  palavrasChave: arrayTexto(LIMITES.ARRAY_MEDIO, LIMITES.TEXTO_CURTO),
  uf: textoOpcional(2),
  municipio: textoOpcional(LIMITES.TEXTO_CURTO),
  logradouro: textoOpcional(LIMITES.TEXTO_CURTO),
  numero: textoOpcional(20),
  bairro: textoOpcional(LIMITES.TEXTO_CURTO),
  cep: z
    .string()
    .max(9)
    .optional()
    .transform((v) => (v ? v.replace(/\D/g, "") : v)),
  descricaoPerfil: textoOpcional(LIMITES.TEXTO_LONGO),
  nomeFantasia: textoOpcional(LIMITES.TEXTO_CURTO),
  telefone: z
    .string()
    .max(20)
    .optional()
    .transform((v) => (v ? v.replace(/\D/g, "") : v)),
  email: z.string().email("Email inválido").max(LIMITES.TEXTO_CURTO).optional().or(z.literal("")),
  site: textoOpcional(LIMITES.TEXTO_CURTO),
  segmento: textoOpcional(LIMITES.TEXTO_CURTO),
  porte: z.enum(["ME", "EPP", "MEDIO", "GRANDE"]).optional(),
  valorMinimo: z
    .number()
    .nonnegative()
    .max(1_000_000_000_000)
    .optional()
    .transform((v) => v?.toString()),
  valorMaximo: z
    .number()
    .nonnegative()
    .max(1_000_000_000_000)
    .optional()
    .transform((v) => v?.toString()),
  ufsBusca: arrayTexto(30, 2),
  buscarBrasilTodo: z.boolean().default(false),
  modalidades: z.array(z.number()).max(LIMITES.ARRAY_PEQUENO),
  contatosWhatsapp: z.array(contatoWhatsappSchema).max(20),
});

export const oportunidadeUpdateSchema = z.object({
  etapa: z
    .enum([
      "identificada",
      "em_analise",
      "proposta_enviada",
      "aguardando_resultado",
      "ganha",
      "perdida",
    ])
    .optional(),
  responsavel: textoOpcional(LIMITES.TEXTO_CURTO),
  valorProposta: z
    .number()
    .nonnegative()
    .max(1_000_000_000_000)
    .optional()
    .transform((v) => v?.toString()),
  observacoes: textoOpcional(LIMITES.TEXTO_LONGO),
});

export const oportunidadeCreateSchema = z.object({
  licitacaoId: z.string().uuid(),
});

export const prazoCreateSchema = z.object({
  titulo: texto(LIMITES.TEXTO_CURTO).min(1, "Informe o título do prazo"),
  tipo: z.enum(["sessao", "impugnacao", "recurso", "entrega_documentos", "outro"]),
  data: z.string().min(1, "Informe a data").max(40),
  oportunidadeId: z.string().uuid().optional(),
  licitacaoId: z.string().uuid().optional(),
  observacoes: textoOpcional(LIMITES.TEXTO_LONGO),
});

export const prazoUpdateSchema = z.object({
  titulo: textoOpcional(LIMITES.TEXTO_CURTO),
  tipo: z
    .enum(["sessao", "impugnacao", "recurso", "entrega_documentos", "outro"])
    .optional(),
  data: z.string().max(40).optional(),
  concluido: z.boolean().optional(),
  observacoes: textoOpcional(LIMITES.TEXTO_LONGO),
});

export const documentoManualSchema = z.object({
  nome: textoOpcional(LIMITES.TEXTO_CURTO),
  numeroIdentificacao: textoOpcional(LIMITES.TEXTO_CURTO),
  dataValidade: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida")
    .optional(),
});

export type CadastroInput = z.infer<typeof cadastroSchema>;
export type EmpresaInput = z.infer<typeof empresaSchema>;
