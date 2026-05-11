const { getPublicKey } = require("../crypto/rsaKeys");
const { encrypt, decrypt, decryptToJSON } = require("../crypto/cryptoUtils");

/**
 * GET /crypto/public-key
 * Retorna a chave pública RSA em formato PEM.
 * O cliente usa essa chave para cifrar os dados antes de enviar.
 */
exports.getPublicKey = (req, res) => {
  res.json({
    algorithm: "RSA",
    bits: 2048,
    format: "PEM (SPKI)",
    publicKey: getPublicKey(),
    info: {
      descricao: "Chave pública RSA de 2048 bits",
      uso: "Use esta chave para cifrar dados antes de enviar para a API",
      padding: "OAEP com SHA-256",
      criptografiaHibrida:
        "Os dados são cifrados com AES-256-CBC, e a chave AES é cifrada com esta chave RSA",
    },
  });
};

/**
 * POST /crypto/encrypt
 * Endpoint de demonstração: cifra os dados enviados no body.
 * Útil para testar sem precisar implementar a criptografia no cliente.
 *
 * Body: qualquer JSON
 * Resposta: { encryptedKey, iv, encryptedData }
 */
exports.encryptData = (req, res) => {
  try {
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ error: "Envie dados no body para cifrar" });
    }

    const encrypted = encrypt(data);

    res.json({
      mensagem: "Dados cifrados com sucesso usando RSA 2048 + AES-256-CBC",
      dadosOriginais: data,
      dadosCifrados: encrypted,
      instrucoes:
        "Envie o objeto 'dadosCifrados' para POST /crypto/decrypt ou use como body cifrado nas rotas da API",
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao cifrar dados", detalhes: err.message });
  }
};

/**
 * POST /crypto/decrypt
 * Endpoint de demonstração: decifra dados previamente cifrados.
 *
 * Body: { encryptedKey, iv, encryptedData }
 * Resposta: dados originais decifrados
 */
exports.decryptData = (req, res) => {
  try {
    const { encryptedKey, iv, encryptedData } = req.body;

    if (!encryptedKey || !iv || !encryptedData) {
      return res.status(400).json({
        error: "Envie encryptedKey, iv e encryptedData no body",
        exemplo: {
          encryptedKey: "(chave AES cifrada com RSA, base64)",
          iv: "(vetor de inicialização, base64)",
          encryptedData: "(dados cifrados com AES, base64)",
        },
      });
    }

    const decrypted = decryptToJSON({ encryptedKey, iv, encryptedData });

    res.json({
      mensagem: "Dados decifrados com sucesso",
      dadosDecifrados: decrypted,
    });
  } catch (err) {
    res
      .status(400)
      .json({ error: "Erro ao decifrar dados", detalhes: err.message });
  }
};

/**
 * GET /crypto/info
 * Retorna informações detalhadas sobre a criptografia usada na API.
 * Útil para a apresentação em sala de aula.
 */
exports.getInfo = (req, res) => {
  res.json({
    titulo: "Criptografia Assimétrica na API NanaDeBets",
    algoritmos: {
      assimetrico: {
        nome: "RSA (Rivest-Shamir-Adleman)",
        bits: 2048,
        tipo: "Assimétrica (par de chaves)",
        padding: "OAEP (Optimal Asymmetric Encryption Padding) com SHA-256",
        uso: "Cifrar/decifrar a chave simétrica AES",
        fundamentoMatematico:
          "Baseado na dificuldade de fatorar o produto de dois números primos muito grandes. " +
          "Se n = p × q (onde p e q são primos grandes), descobrir p e q a partir de n é computacionalmente inviável.",
        formulaCifrar: "c = m^e mod n (m = mensagem, e = expoente público, n = módulo)",
        formulaDecifrar: "m = c^d mod n (c = cifrado, d = expoente privado, n = módulo)",
      },
      simetrico: {
        nome: "AES-256-CBC (Advanced Encryption Standard)",
        bits: 256,
        tipo: "Simétrica (chave única)",
        modo: "CBC (Cipher Block Chaining)",
        ivBits: 128,
        uso: "Cifrar/decifrar os dados da requisição (mais rápido que RSA para dados grandes)",
      },
    },
    fluxo: [
      "1. O servidor gera um par de chaves RSA 2048 bits (pública + privada)",
      "2. O cliente obtém a chave pública via GET /crypto/public-key",
      "3. Para enviar dados cifrados, o cliente:",
      "   a) Gera uma chave AES-256 aleatória (chave de sessão)",
      "   b) Cifra os dados com AES-256-CBC usando a chave de sessão",
      "   c) Cifra a chave AES com a chave pública RSA do servidor",
      "   d) Envia: { encryptedKey, iv, encryptedData }",
      "4. O servidor recebe e:",
      "   a) Decifra a chave AES com sua chave privada RSA",
      "   b) Usa a chave AES para decifrar os dados",
      "   c) Processa a requisição normalmente",
    ],
    porqueHibrida:
      "O RSA 2048 só consegue cifrar até ~190 bytes diretamente. " +
      "Para dados maiores, usamos AES (rápido) para cifrar os dados e RSA (seguro) " +
      "apenas para proteger a chave AES. Isso combina a segurança do RSA com a velocidade do AES.",
    endpoints: {
      "GET /crypto/public-key": "Obtém a chave pública RSA",
      "POST /crypto/encrypt": "Cifra dados (endpoint de demonstração)",
      "POST /crypto/decrypt": "Decifra dados cifrados",
      "GET /crypto/info": "Esta página de informações",
      "POST /apostas (com header X-Encrypted: true)":
        "Cria aposta com body cifrado (middleware decifra automaticamente)",
    },
  });
};
