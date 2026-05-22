require("dotenv").config();
const app = require("./app/app.js");

// Pega a porta e o host do .env, com fallbacks padrão
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0"; // 0.0.0.0 permite que aceite conexões externas na VPS

app.listen(PORT, HOST, () => {
  console.log(`Servidor rodando em http://${HOST}:${PORT}`);
});
