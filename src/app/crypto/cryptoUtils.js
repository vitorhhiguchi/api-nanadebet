const crypto = require("crypto");
const { getPublicKey, getPrivateKey } = require("./rsaKeys");

/**
 * ========================================================
 * CRIPTOGRAFIA HÍBRIDA: RSA + AES
 * ========================================================
 *
 * POR QUE HÍBRIDA?
 * O RSA só consegue cifrar dados menores que o tamanho da chave
 * (com RSA 2048 e padding OAEP, o limite é ~190 bytes).
 * Para cifrar dados maiores (como o body de uma requisição),
 * usamos uma abordagem híbrida:
 *
 * 1. Geramos uma chave AES-256 aleatória (chave simétrica de sessão)
 * 2. Ciframos os DADOS com AES-256-CBC (simétrica, rápida)
 * 3. Ciframos a CHAVE AES com RSA (assimétrica, segura)
 * 4. Enviamos os dois juntos
 *
 * Para decifrar:
 * 1. Deciframos a chave AES com a chave privada RSA
 * 2. Usamos a chave AES para decifrar os dados
 *
 * ALGORITMOS USADOS:
 * - RSA 2048 bits com padding OAEP (Optimal Asymmetric Encryption Padding)
 * - AES-256-CBC (Advanced Encryption Standard, 256 bits, Cipher Block Chaining)
 *
 * BITS:
 * - RSA: 2048 bits (tamanho do módulo)
 * - AES: 256 bits (tamanho da chave simétrica)
 * - IV (vetor de inicialização): 128 bits (16 bytes)
 * ========================================================
 */

/**
 * Cifra dados usando criptografia híbrida (RSA + AES).
 *
 * @param {string|object} data - Dados a serem cifrados (string ou objeto JSON)
 * @returns {object} Objeto com os dados cifrados:
 *   - encryptedKey: chave AES cifrada com RSA (base64)
 *   - iv: vetor de inicialização do AES (base64)
 *   - encryptedData: dados cifrados com AES (base64)
 */
function encrypt(data) {
  const plainText = typeof data === "string" ? data : JSON.stringify(data);

  // 1. Gerar chave AES-256 aleatória (32 bytes = 256 bits) e IV (16 bytes = 128 bits)
  const aesKey = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);

  // 2. Cifrar os dados com AES-256-CBC
  const cipher = crypto.createCipheriv("aes-256-cbc", aesKey, iv);
  let encryptedData = cipher.update(plainText, "utf8", "base64");
  encryptedData += cipher.final("base64");

  // 3. Cifrar a chave AES com a chave pública RSA (padding OAEP)
  const encryptedKey = crypto.publicEncrypt(
    {
      key: getPublicKey(),
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    aesKey,
  );

  return {
    encryptedKey: encryptedKey.toString("base64"),
    iv: iv.toString("base64"),
    encryptedData: encryptedData,
  };
}

/**
 * Decifra dados que foram cifrados com criptografia híbrida (RSA + AES).
 *
 * @param {object} payload - Objeto com os dados cifrados:
 *   - encryptedKey: chave AES cifrada com RSA (base64)
 *   - iv: vetor de inicialização do AES (base64)
 *   - encryptedData: dados cifrados com AES (base64)
 * @returns {string} Dados decifrados em texto
 */
function decrypt(payload) {
  const { encryptedKey, iv, encryptedData } = payload;

  // 1. Decifrar a chave AES com a chave privada RSA
  const aesKey = crypto.privateDecrypt(
    {
      key: getPrivateKey(),
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(encryptedKey, "base64"),
  );

  // 2. Decifrar os dados com a chave AES recuperada
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    aesKey,
    Buffer.from(iv, "base64"),
  );
  let decryptedData = decipher.update(encryptedData, "base64", "utf8");
  decryptedData += decipher.final("utf8");

  return decryptedData;
}

/**
 * Tenta parsear o resultado decifrado como JSON.
 * Se não for JSON válido, retorna a string.
 */
function decryptToJSON(payload) {
  const decrypted = decrypt(payload);
  try {
    return JSON.parse(decrypted);
  } catch {
    return decrypted;
  }
}

module.exports = { encrypt, decrypt, decryptToJSON };
