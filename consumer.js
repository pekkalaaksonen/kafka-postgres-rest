const { Kafka, CompressionTypes, CompressionCodecs } = require("kafkajs");
const SnappyCodec = require("kafkajs-snappy");
const avro = require("avsc");
const config = require("./config");

CompressionCodecs[CompressionTypes.Snappy] = SnappyCodec;

const kafka = new Kafka({
  clientId: `${config.kafka.clientId}` /* "kafkaTest" */,
  brokers: [`${config.kafka.brokers}`]
});

const consumer = kafka.consumer({ groupId: `${config.kafka.groupId}` });

let messages = [];

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: `${config.kafka.topics}` });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const buf = Buffer.from(message.value, "binary");
      const decoder = new avro.streams.BlockDecoder();
      decoder.on("data", function(val) {
        console.log(`Message received: ${val}`);
        messages.push({ value: val });
        console.log(`Messages in queue: ${messages.length}.`);
      });
      decoder.end(buf);
    }
  });
};

const resetMessageQueue = () => {
  messages = [];
  console.log(`Message queue set to ${messages.length}.`);
};

const getMessages = () => {
  return messages;
};

module.exports = {
  run: run,
  getMessages: getMessages,
  resetMessageQueue: resetMessageQueue
};
