/**
 * Rate Limiter simples em memória para Server Actions.
 * 
 * Usa um Map com TTL para limitar requisições por chave (ex: userId).
 * Em produção com múltiplas instâncias, usar Redis ou similar.
 * Para o contexto do JJCAC (projeto social, single-instance), isso é suficiente.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Limpa entradas expiradas a cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitConfig {
  /** Número máximo de requisições permitidas na janela */
  maxRequests: number;
  /** Janela de tempo em segundos */
  windowSeconds: number;
}

interface RateLimitResult {
  allowed: boolean;
  /** Segundos restantes até reset (se bloqueado) */
  retryAfter?: number;
}

/**
 * Verifica se uma chave está dentro do limite de taxa.
 * 
 * @example
 * const result = checkRateLimit(`checkin:${userId}`, { maxRequests: 1, windowSeconds: 30 });
 * if (!result.allowed) return { error: `Aguarde ${result.retryAfter}s` };
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  // Se não existe entrada ou já expirou, cria nova
  if (!entry || entry.resetAt <= now) {
    store.set(key, {
      count: 1,
      resetAt: now + config.windowSeconds * 1000,
    });
    return { allowed: true };
  }

  // Se ainda está na janela, verifica o count
  if (entry.count < config.maxRequests) {
    entry.count++;
    return { allowed: true };
  }

  // Bloqueado
  const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
  return { allowed: false, retryAfter };
}
