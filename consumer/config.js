let topics;
let config;

const loadTopics = () => {
  switch (process.env.NODE_ENV) {
    case "DEV":
      topics = require("./config/topics").dev;
      return topics;
    case "TEST":
      topics = require("./config/topics").test;
      return topics;
    case "PROD":
      topics = require("./config/topics").prod;
      return topics;
  }
};

const loadConfig = () => {
  switch (process.env.NODE_ENV) {
    case "DEV":
      config = require("./config/config").dev;
      return config;
    case "TEST":
      config = require("./config/config").test;
      return config;
    case "PROD":
      config = require("./config/config").prod;
      return config;
  }
};

module.exports = {
  loadTopics: loadTopics,
  loadConfig: loadConfig
};
