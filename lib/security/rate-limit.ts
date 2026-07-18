/**
 * Rate limit simples em memória (por processo). Suficiente para a fase
 * atual (validação local / instância única). Se o app rodar em múltiplas
 * instâncias (ex.: Vercel serverless com vários lambdas simultâneos), cada
 * instância tem seu próprio contador — para produção com múltiplas
 * instâncias, trocar por um limiter compartilhado (ex.: Upstash Redis).
 */

const contadores = new Map<string, { count: number; resetAt: number }>();

// Evita crescimento ilimitado do Map em processos de longa duração.
setInterval(() => {
  const agora = Date.now();
  for (const [chave, entrada] of contadores) {
    if (entrada.resetAt <= agora) contadores.delete(chave);
  }
}, 5 * 60 * 1000).unref?.();

export function rateLimit(
  chave: string,
  { janelaMs, max }: { janelaMs: number; max: number }
): { permitido: boolean; retryAfterMs: number } {
  const agora = Date.now();
  const entrada = contadores.get(chave);

  if (!entrada || entrada.resetAt <= agora) {
    contadores.set(chave, { count: 1, resetAt: agora + janelaMs });
    return { permitido: true, retryAfterMs: 0 };
  }

  if (entrada.count >= max) {
    return { permitido: false, retryAfterMs: entrada.resetAt - agora };
  }

  entrada.count += 1;
  return { permitido: true, retryAfterMs: 0 };
}

export function ipDaRequisicao(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
