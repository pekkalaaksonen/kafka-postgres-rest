"use strict";

const express = require("express");
const app = express();
const { fetchTopic, fetchTables } = require("./queries");

const port = process.env.PORT || 3000;

app.use("/", express.static("public"));
app.get(`/topic/:topic`, fetchTopic);
app.get(`/topics`, fetchTables);
app.get(`*`, (req, res) => {
  res.status(404).send("404");
});

app.listen(port, () => console.log(`Listening port ${port}`));
