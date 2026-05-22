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
  const isEncrypted = req.headers["x-encrypted"] === "true";

  // FORÇAR CRIPTOGRAFIA: Rejeita se não tiver o header
  if (!isEncrypted) {
    return res.status(403).json({ 
      error: "Acesso Negado", 
      mensagem: "Esta API aceita apenas requisições criptografadas. Envie o header 'X-Encrypted: true'." 
    });
  }

  // Se for uma requisição que geralmente tem body (POST, PUT, PATCH)
  if (req.method !== "GET" && req.method !== "HEAD" && Object.keys(req.body).length > 0) {
    try {
      const { encryptedKey, iv, encryptedData } = req.body;

      if (!encryptedKey || !iv || !encryptedData) {
        return res.status(400).json({
          error: "Body cifrado inválido",
          mensagem:
            "O body deve conter: encryptedKey, iv, encryptedData",
        });
      }

      // Decifra e substitui o body
      const decryptedData = decryptToJSON({ encryptedKey, iv, encryptedData });
      req.body = decryptedData;

      console.log("[CRYPTO] Body decifrado com sucesso via middleware");
    } catch (err) {
      return res.status(400).json({
        error: "Falha ao decifrar o body da requisição",
        detalhes: err.message,
      });
    }
  }

  next();
}

module.exports = decryptMiddleware;
