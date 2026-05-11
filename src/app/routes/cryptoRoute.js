const express = require("express");
const router = express.Router();

const cryptoController = require("../controllers/cryptoController.js");

// Informações sobre a criptografia usada (útil para apresentação)
router.get("/info", cryptoController.getInfo);

// Obter a chave pública RSA
router.get("/public-key", cryptoController.getPublicKey);

// Demonstração: cifrar dados
router.post("/encrypt", cryptoController.encryptData);

// Demonstração: decifrar dados
router.post("/decrypt", cryptoController.decryptData);

module.exports = router;
