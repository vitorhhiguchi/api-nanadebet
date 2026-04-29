const Aposta = require("../database/aposta");

exports.getApostas = async (req, res) => {
  const apostas = await Aposta.findAll();
  res.json(apostas);
};

exports.createAposta = async (req, res) => {
  const { idApostador, valor, idLuta, idLutador1, idLutador2 } = req.body;

  if (idApostador == null || valor == null || idLuta == null) {
    return res.status(400).json({
      error: "idApostador, valor e idLuta são obrigatórios",
    });
  }

  const aposta = await Aposta.create({
    idApostador,
    valor,
    idLuta,
    idLutador1: idLutador1 || null,
    idLutador2: idLutador2 || null,
  });

  res.status(201).json(aposta);
};

exports.updateAposta = async (req, res) => {
  const id = Number(req.params.id);
  const aposta = await Aposta.findByPk(id);

  if (!aposta) {
    return res.status(404).json({ error: "Aposta não encontrada" });
  }

  const { valor } = req.body;

  if (valor === undefined) {
    return res
      .status(400)
      .json({ error: "Informe o campo valor para atualizar" });
  }

  await aposta.update({ valor });

  res.json(aposta);
};

exports.deleteAposta = async (req, res) => {
  const id = Number(req.params.id);
  const deleted = await Aposta.destroy({ where: { id } });

  if (!deleted) {
    return res.status(404).json({ error: "Aposta não encontrada" });
  }

  res.status(204).send();
};
