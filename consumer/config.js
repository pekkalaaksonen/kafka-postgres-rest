const loadTopics = function(topics) {
  for (const topic in topics) {
    if (
      topics[topic] === null ||
      topics[topic] === "" ||
      topics[topic].replace(/\s/g, "").length === 0
    ) {
      topics[topic] = topic
        .split(".")
        .join("_")
        .split("-")
        .join("_");
    }
  }

  return topics;
};

const loadConfig = () => {
  return require("./config/config")[process.env.NODE_ENV.toLowerCase()];
};

module.exports = {
  loadTopics: loadTopics,
  loadConfig: loadConfig
};
