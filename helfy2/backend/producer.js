const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'backend-app',
  brokers: [process.env.KAFKA_BROKERS || 'kafka:9092'],
});

const producer = kafka.producer();

async function sendMessage(topic, message) {
  await producer.connect();
  await producer.send({
    topic,
    messages: [
      { value: JSON.stringify(message) }
    ],
  });
  await producer.disconnect();
}

module.exports = { sendMessage };
