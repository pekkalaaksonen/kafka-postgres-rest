const { loadTopics, loadConfig } = require("./config");
const topics = loadTopics(
  require("./config/topics")[process.env.NODE_ENV.toLowerCase()]
);
const config = loadConfig();
const {
  Kafka,
  CompressionTypes,
  CompressionCodecs,
  logLevel
} = require("kafkajs");
const SnappyCodec = require("kafkajs-snappy");
const avro = require("avsc");
const insertRows = require("./queries").insertRows;
const fs = require("fs");
const path = require("path");

CompressionCodecs[CompressionTypes.Snappy] = SnappyCodec;

const kafkaConfig = {
  clientId: config.kafka.clientId,
  brokers: config.kafka.brokers,
  logLevel: logLevel.INFO
};

if (config.kafka.ssl === true) {
  Object.assign(kafkaConfig, {
    ssl: {
      rejectUnauthorized: false,
      ca: fs.readFileSync(
        path.join(__dirname, "/certs", config.kafka.certs.ca),
        "utf-8"
      ),
      cert: fs.readFileSync(
        path.join(__dirname, "/certs", config.kafka.certs.cert),
        "utf-8"
      ),
      key: fs.readFileSync(
        path.join(__dirname, "/certs", config.kafka.certs.key),
        "utf-8"
      )
    }
  });
}

const kafka = new Kafka(kafkaConfig);

const consumer = kafka.consumer({
  groupId: config.kafka.groupId
});

const run = async () => {
  await consumer.connect();
  await Object.keys(topics).forEach(topic => {
    consumer.subscribe({ topic: topic, fromBeginning: false });
  });

  await consumer.run({
    eachBatch: async ({
      batch,
      resolveOffset,
      heartbeat,
      commitOffsetsIfNecessary
    }) => {
      console.log(
        `${batch.messages.length}${
          batch.messages.length > 1 ? " messages" : " message"
        } received from topic ${batch.topic}.`
      );

      const decodedMessages = [];

      for await (const message of batch.messages) {
        const decoder = new avro.streams.BlockDecoder();
        await new Promise((resolve, reject) => {
          decoder.on("data", decodedMessage => {
            decodedMessages.push({
              topic: batch.topic,
              timestamp: new Date().toISOString(),
              data: decodedMessage
            });
          });
          decoder.on("end", resolve);
          decoder.on("error", reject);
          decoder.end(message.value);
        });

        resolveOffset(message.offset);
        await commitOffsetsIfNecessary();
        await heartbeat();
      }

      await insertRows(topics[batch.topic], decodedMessages);
    }
  });
};

run().catch(e => console.error(e.message, e));

const errorTypes = ["unhandledRejection", "uncaughtException"];
const signalTraps = ["SIGTERM", "SIGINT", "SIGUSR2"];

errorTypes.map(type => {
  process.on(type, async e => {
    try {
      console.log(`process.on ${type}`);
      console.error(e);
      await consumer.disconnect();
      process.exit(0);
    } catch (_) {
      process.exit(1);
    }
  });
});

signalTraps.map(type => {
  process.once(type, async () => {
    try {
      await consumer.disconnect();
    } finally {
      process.kill(process.pid, type);
    }
  });
});
