"use strict";

const express = require("express");
const app = express();
const consumer = require("./consumer");
const config = require("./config"); // rename config_template.json => config.json and enter required data there

app.get("/", (req, res) => {
  console.log(`GET request received.`);
  if (consumer.getMessages().length > 0) {
    res.send(consumer.getMessages());
    console.log(`${consumer.getMessages().length} messages sent.`);
    consumer.resetMessageQueue();
  } else {
    console.log(`Message queue empty. No messages sent.`);
    res.send("No new messages!");
  }
});
app.listen(config.httpServer.port, () =>
  console.log(`Listening port ${config.httpServer.port}`)
);

consumer.run();
