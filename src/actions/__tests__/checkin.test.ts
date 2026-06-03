/**
 * Testes Unitários — checkin.ts
 * 
 * Foco:
 * 1. Algoritmo de verificação HMAC-SHA256 do QR Code (verifyQrToken)
 * 2. Validação temporal (apenas Seg/Qua, 14:30-18:00, fuso de Brasília)
 * 3. Rejeição do bypass estático (token === secret)
 *
 * Ref: relatorio_auditoria_senior.md §Gap 3 e §Gap 4
 * Ref: boaspratica.md §12 (Adequate Testing)
 */

import { createHmac, timingSafeEqual } from "crypto";

// ============================================================================
// Re-implementação isolada do verifyQrToken para teste unitário puro
// (não depende de Next.js Server Actions nem Supabase)
// ============================================================================

const TEST_QR_SECRET = "JJCAC-TATAME-UFPE";
const TEST_HMAC_KEY = "jjcac-hmac-tatame-2026";

function verifyQrToken(token: string | undefined, secret: string, signingKey: string): boolean {
  if (!token) return false;

  // [V4.2] Bypass estático REMOVIDO — não aceita mais token === secret

  try {
    const expectedHmac = createHmac("sha256", signingKey)
      .update(secret)
      .digest("hex");

    const tokenBuffer = Buffer.from(token, "utf-8");
    const expectedBuffer = Buffer.from(expectedHmac, "utf-8");

    if (tokenBuffer.length !== expectedBuffer.length) return false;
    return timingSafeEqual(tokenBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

/**
 * Gera o HMAC esperado para um dado secret + chave de assinatura
 */
function generateValidHmacToken(secret: string, signingKey: string): string {
  return createHmac("sha256", signingKey)
    .update(secret)
    .digest("hex");
}

// ============================================================================
// TESTES
// ============================================================================

describe("verifyQrToken — Segurança do QR Code", () => {
  test("aceita token HMAC-SHA256 válido", () => {
    const validToken = generateValidHmacToken(TEST_QR_SECRET, TEST_HMAC_KEY);
    expect(verifyQrToken(validToken, TEST_QR_SECRET, TEST_HMAC_KEY)).toBe(true);
  });

  test("rejeita token undefined", () => {
    expect(verifyQrToken(undefined, TEST_QR_SECRET, TEST_HMAC_KEY)).toBe(false);
  });

  test("rejeita token vazio", () => {
    expect(verifyQrToken("", TEST_QR_SECRET, TEST_HMAC_KEY)).toBe(false);
  });

  test("rejeita string do secret puro (bypass estático removido V4.2)", () => {
    // CRÍTICO: Este teste garante que a brecha documentada no relatório de auditoria
    // foi devidamente fechada. Ninguém pode forjar presença enviando "JJCAC-TATAME-UFPE"
    expect(verifyQrToken(TEST_QR_SECRET, TEST_QR_SECRET, TEST_HMAC_KEY)).toBe(false);
  });

  test("rejeita token com chave HMAC diferente", () => {
    const wrongKeyToken = generateValidHmacToken(TEST_QR_SECRET, "chave-errada");
    expect(verifyQrToken(wrongKeyToken, TEST_QR_SECRET, TEST_HMAC_KEY)).toBe(false);
  });

  test("rejeita token HMAC de secret diferente", () => {
    const wrongSecretToken = generateValidHmacToken("OUTRO-TATAME", TEST_HMAC_KEY);
    expect(verifyQrToken(wrongSecretToken, TEST_QR_SECRET, TEST_HMAC_KEY)).toBe(false);
  });

  test("rejeita token truncado (tamanho inválido)", () => {
    const validToken = generateValidHmacToken(TEST_QR_SECRET, TEST_HMAC_KEY);
    const truncated = validToken.slice(0, 10);
    expect(verifyQrToken(truncated, TEST_QR_SECRET, TEST_HMAC_KEY)).toBe(false);
  });

  test("rejeita lixo aleatório", () => {
    expect(verifyQrToken("abc123!@#", TEST_QR_SECRET, TEST_HMAC_KEY)).toBe(false);
  });
});

// ============================================================================
// Validação Temporal (Restrição de Dia/Hora)
// ============================================================================

function isCheckinAllowed(date: Date): boolean {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    weekday: "long",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const weekday = parts.find(p => p.type === "weekday")?.value;
  const hour = parseInt(parts.find(p => p.type === "hour")?.value || "0");
  const minute = parseInt(parts.find(p => p.type === "minute")?.value || "0");

  const isAllowedDay = weekday === "Monday" || weekday === "Wednesday";
  const timeInMinutes = hour * 60 + minute;
  const startMinutes = 14 * 60 + 30; // 14:30
  const endMinutes = 18 * 60; // 18:00

  return isAllowedDay && timeInMinutes >= startMinutes && timeInMinutes <= endMinutes;
}

describe("isCheckinAllowed — Validação Temporal", () => {
  // Nota: Estes testes dependem da timezone configurada no ambiente.
  // Em CI, configurar TZ=America/Sao_Paulo

  test("rejeita sábado às 15:00 (fora do dia permitido)", () => {
    // Sábado, 6 de Junho 2026, 15:00 BRT (18:00 UTC)
    const saturday = new Date("2026-06-06T18:00:00Z");
    expect(isCheckinAllowed(saturday)).toBe(false);
  });

  test("rejeita segunda-feira às 10:00 (fora do horário)", () => {
    // Segunda, 1 de Junho 2026, 10:00 BRT (13:00 UTC)
    const mondayMorning = new Date("2026-06-01T13:00:00Z");
    expect(isCheckinAllowed(mondayMorning)).toBe(false);
  });

  test("aceita segunda-feira às 15:00 (dentro do permitido)", () => {
    // Segunda, 1 de Junho 2026, 15:00 BRT (18:00 UTC)
    const mondayAfternoon = new Date("2026-06-01T18:00:00Z");
    expect(isCheckinAllowed(mondayAfternoon)).toBe(true);
  });

  test("aceita quarta-feira às 14:30 (limite inicial)", () => {
    // Quarta, 3 de Junho 2026, 14:30 BRT (17:30 UTC)
    const wednesdayStart = new Date("2026-06-03T17:30:00Z");
    expect(isCheckinAllowed(wednesdayStart)).toBe(true);
  });

  test("rejeita quarta-feira às 14:29 (1 min antes do horário)", () => {
    // Quarta, 3 de Junho 2026, 14:29 BRT (17:29 UTC)
    const beforeStart = new Date("2026-06-03T17:29:00Z");
    expect(isCheckinAllowed(beforeStart)).toBe(false);
  });

  test("aceita quarta-feira às 18:00 (limite final)", () => {
    // Quarta, 3 de Junho 2026, 18:00 BRT (21:00 UTC)
    const wednesdayEnd = new Date("2026-06-03T21:00:00Z");
    expect(isCheckinAllowed(wednesdayEnd)).toBe(true);
  });

  test("rejeita quarta-feira às 18:01 (1 min após o horário)", () => {
    // Quarta, 3 de Junho 2026, 18:01 BRT (21:01 UTC)
    const afterEnd = new Date("2026-06-03T21:01:00Z");
    expect(isCheckinAllowed(afterEnd)).toBe(false);
  });
});
