/** Limites de tamanho usados nos schemas zod, para evitar armazenamento
 * abusivo e amplificação de custo de IA via payloads gigantes. */
export const LIMITES = {
  TEXTO_CURTO: 200,
  TEXTO_MEDIO: 500,
  TEXTO_LONGO: 5000,
  ARRAY_PEQUENO: 30,
  ARRAY_MEDIO: 100,
} as const;
