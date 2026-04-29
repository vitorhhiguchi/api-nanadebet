const express = require("express");
const apostasRoute = require("./routes/apostasRoute");

const app = express();

app.use(express.json());
app.use("/apostas", apostasRoute);

module.exports = app;
