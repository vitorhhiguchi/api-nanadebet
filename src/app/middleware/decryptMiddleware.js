const { decryptToJSON } = require("../crypto/cryptoUtils");

/**
 * Middleware que decifra automaticamente o body da requisição
 * quando o header "X-Encrypted: true" está presente.
 *
 * Se o header não estiver presente, a requisição passa direto
 * sem alteração (compatibilidade com requisições normais).
 *
 * Uso:
 *   O cliente envia:
 *   - Header: X-Encrypted: true
 *   - Body: { encryptedKey, iv, encryptedData }
 *
 *   O middleware decifra e substitui o req.body pelos dados originais.
 */
function decryptMiddleware(req, res, next) {
  // Só decifra se o header X-Encrypted estiver presente
  const isEncrypted = req.headers["x-encrypted"] === "true";

  if (!isEncrypted) {
    return next(); // Requisição normal, segue sem alteração
  }

  try {
    const { encryptedKey, iv, encryptedData } = req.body;

    if (!encryptedKey || !iv || !encryptedData) {
      return res.status(400).json({
        error: "Body cifrado inválido",
        mensagem:
          "Quando X-Encrypted: true, o body deve conter: encryptedKey, iv, encryptedData",
      });
    }

    // Decifra e substitui o body
    const decryptedData = decryptToJSON({ encryptedKey, iv, encryptedData });
    req.body = decryptedData;

    console.log("[CRYPTO] Body decifrado com sucesso via middleware");
    next();
  } catch (err) {
    res.status(400).json({
      error: "Falha ao decifrar o body da requisição",
      detalhes: err.message,
    });
  }
}

module.exports = decryptMiddleware;
