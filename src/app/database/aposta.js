const Sequelize = require("sequelize");
const { connection } = require("./mysql");

const Aposta = connection.define(
  "apostas",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    idApostador: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    valor: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
    idLuta: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    idLutador1: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    idLutador2: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  },
);

module.exports = Aposta;
