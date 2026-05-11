const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// Caminhos para salvar as chaves em disco
const KEYS_DIR = path.join(__dirname, "..", "..", "..", "keys");
const PRIVATE_KEY_PATH = path.join(KEYS_DIR, "private.pem");
const PUBLIC_KEY_PATH = path.join(KEYS_DIR, "public.pem");

let publicKey = null;
let privateKey = null;

/**
 * Gera um novo par de chaves RSA de 2048 bits.
 *
 * ALGORITMO: RSA (Rivest-Shamir-Adleman)
 * BITS: 2048
 * FORMATO: PEM (Privacy-Enhanced Mail)
 *
 * POR TRÁS:
 * - O RSA se baseia na dificuldade matemática de fatorar o produto
 *   de dois números primos muito grandes.
 * - São gerados dois primos grandes (p e q), e o módulo n = p * q.
 * - A chave pública contém (n, e) onde e é o expoente público (geralmente 65537).
 * - A chave privada contém (n, d) onde d é o expoente privado,
 *   calculado como o inverso modular de e em relação a φ(n).
 * - Cifrar: c = m^e mod n
 * - Decifrar: m = c^d mod n
 */
function generateKeyPair() {
  const { publicKey: pubKey, privateKey: privKey } =
    crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048, // Tamanho em bits
      publicKeyEncoding: {
        type: "spki", // Subject Public Key Info (padrão X.509)
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs8", // Public-Key Cryptography Standards #8
        format: "pem",
      },
    });

  return { publicKey: pubKey, privateKey: privKey };
}

/**
 * Inicializa as chaves RSA.
 * Se já existirem salvas em disco, carrega. Caso contrário, gera novas.
 */
function initializeKeys() {
  try {
    // Tenta carregar chaves existentes
    if (fs.existsSync(PRIVATE_KEY_PATH) && fs.existsSync(PUBLIC_KEY_PATH)) {
      privateKey = fs.readFileSync(PRIVATE_KEY_PATH, "utf8");
      publicKey = fs.readFileSync(PUBLIC_KEY_PATH, "utf8");
      console.log("[CRYPTO] Chaves RSA carregadas do disco.");
      return;
    }
  } catch (err) {
    console.log("[CRYPTO] Não foi possível carregar chaves do disco, gerando novas...");
  }

  // Gera novas chaves
  const keys = generateKeyPair();
  publicKey = keys.publicKey;
  privateKey = keys.privateKey;

  // Salva em disco para persistência
  try {
    if (!fs.existsSync(KEYS_DIR)) {
      fs.mkdirSync(KEYS_DIR, { recursive: true });
    }
    fs.writeFileSync(PRIVATE_KEY_PATH, privateKey);
    fs.writeFileSync(PUBLIC_KEY_PATH, publicKey);
    console.log("[CRYPTO] Novo par de chaves RSA 2048 bits gerado e salvo.");
  } catch (err) {
    console.log("[CRYPTO] Chaves geradas em memória (não foi possível salvar em disco).");
  }
}

function getPublicKey() {
  if (!publicKey) initializeKeys();
  return publicKey;
}

function getPrivateKey() {
  if (!privateKey) initializeKeys();
  return privateKey;
}

// Inicializa ao carregar o módulo
initializeKeys();

module.exports = { getPublicKey, getPrivateKey };
