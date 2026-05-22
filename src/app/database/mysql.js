require("dotenv").config();
const Sequelize = require("sequelize");

const connection = new Sequelize(
  process.env.DATABASE_NAME || "nanadebets",
  process.env.DATABASE_USER || "postgres",
  process.env.DATABASE_PASSWORD || "",
  {
    host: process.env.DATABASE_HOST || "127.0.0.1",
    port: process.env.DATABASE_PORT || 3306,
    dialect: "mysql",
    logging: false,
  },
);

connection
  .authenticate()
  .then(async () => {
    console.log("[DATABASE] Conectado com sucesso.");
    await connection.sync({ alter: true });
    console.log("[DATABASE] Tabelas sincronizadas.");
  })
  .catch((err) => {
    console.error("[DATABASE] Erro ao conectar:", err);
    process.exit(1);
  });

module.exports = { connection };
