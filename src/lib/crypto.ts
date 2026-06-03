/**
 * Utilitário de criptografia simétrica para dados sensíveis em repouso (LGPD).
 *
 * Utiliza AES-256-CBC com IV aleatório por operação.
 * A chave de criptografia DEVE ser definida em variável de ambiente:
 *   ENCRYPTION_KEY=<string hex de 64 caracteres (32 bytes)>
 *
 * Formato do texto cifrado: iv_hex:encrypted_hex
 *
 * Ref: segurança.md §1 (proteção de dados sensíveis)
 * Ref: relatorio_auditoria_senior.md §Gap 1 (LGPD)
 */

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16; // AES block size

/**
 * Retorna a chave de criptografia a partir da variável de ambiente.
 * Lança erro fatal se a chave não estiver definida ou for inválida.
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error(
      "[LGPD] ENCRYPTION_KEY não definida. Dados sensíveis não podem ser protegidos."
    );
  }
  const keyBuffer = Buffer.from(key, "hex");
  if (keyBuffer.length !== 32) {
    throw new Error(
      "[LGPD] ENCRYPTION_KEY deve ter exatamente 64 caracteres hexadecimais (32 bytes)."
    );
  }
  return keyBuffer;
}

/**
 * Criptografa uma string usando AES-256-CBC.
 * Retorna o formato `iv_hex:encrypted_hex`.
 * Se o valor for null/undefined/vazio, retorna null (não encripta campos vazios).
 */
export function encryptField(plaintext: string | null | undefined): string | null {
  if (!plaintext || plaintext.trim() === "") return null;

  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
}

/**
 * Descriptografa uma string no formato `iv_hex:encrypted_hex`.
 * Retorna o texto original ou null se o valor for inválido/vazio.
 * Se o valor não estiver no formato criptografado (legacy), retorna como está.
 */
export function decryptField(ciphertext: string | null | undefined): string | null {
  if (!ciphertext || ciphertext.trim() === "") return null;

  // Detecta se o valor está no formato criptografado (iv_hex:encrypted_hex)
  // Um IV hex tem 32 chars, seguido de ":", seguido de hex arbitrário
  const parts = ciphertext.split(":");
  if (parts.length !== 2 || parts[0].length !== 32 || !/^[0-9a-f]+$/i.test(parts[0])) {
    // Valor legado (texto puro) — retorna como está para retrocompatibilidade
    return ciphertext;
  }

  try {
    const key = getEncryptionKey();
    const iv = Buffer.from(parts[0], "hex");
    const encrypted = parts[1];

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch {
    // Se falhar a descriptografia (chave mudou, dado corrompido), retorna null
    // para não expor dados lixo na UI
    console.error("[LGPD] Falha ao descriptografar campo. Possível troca de chave.");
    return null;
  }
}
