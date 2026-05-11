const express = require("express");
const path = require("path");
const apostasRoute = require("./routes/apostasRoute");
const cryptoRoute = require("./routes/cryptoRoute");
const decryptMiddleware = require("./middleware/decryptMiddleware");

const app = express();

app.use(express.json());

// Servir arquivos estáticos (Frontend)
app.use(express.static(path.join(__dirname, "../../public")));

// Rotas de criptografia (obter chave pública, cifrar, decifrar, info)
app.use("/crypto", cryptoRoute);

// Middleware de decifração automática para as rotas de apostas
// Quando o header "X-Encrypted: true" está presente, o body é decifrado antes de chegar no controller
app.use("/apostas", decryptMiddleware, apostasRoute);

module.exports = app;
