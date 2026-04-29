const express = require("express");
const router = express.Router();

const apostasController = require("../controllers/apostasController.js");

router.get("/", apostasController.getApostas);
router.post("/", apostasController.createAposta);
router.put("/:id", apostasController.updateAposta);
router.delete("/:id", apostasController.deleteAposta);

module.exports = router;
