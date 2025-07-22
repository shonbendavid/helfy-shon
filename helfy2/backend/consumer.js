const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'backend-app',
  brokers: [process.env.KAFKA_BROKERS || 'kafka:9092'],
});

const consumer = kafka.consumer({ groupId: 'backend-group' });

async function startConsumer(topic, callback) {
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const data = JSON.parse(message.value.toString());
      callback(data);
    },
  });
}

module.exports = { startConsumer };
