const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'kafka-init',
  brokers: [process.env.KAFKA_BROKERS || 'kafka:9092'],
});

const admin = kafka.admin();

async function waitForKafka(maxRetries = 10, delay = 5000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await admin.connect();
      console.log('Connected to Kafka');
      return;
    } catch (err) {
      console.log(`Kafka not ready, retrying in ${delay / 1000}s...`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw new Error('Kafka not reachable after retries');
}

async function createTopic(topic) {
  try {
    await waitForKafka();
    const topics = await admin.listTopics();
    if (!topics.includes(topic)) {
      console.log(`Topic "${topic}" does not exist. Creating...`);
      const created = await admin.createTopics({
        topics: [{ topic, numPartitions: 1, replicationFactor: 1 }],
      });
      console.log(created ? `Topic "${topic}" created.` : `Failed to create topic "${topic}".`);
    } else {
      console.log(`Topic "${topic}" already exists.`);
    }
  } catch (e) {
    console.error('Error creating topic:', e);
    process.exit(1);
  } finally {
    await admin.disconnect();
    console.log('Kafka topic init finished.');
    process.exit(0);
  }
}

const topic = process.env.KAFKA_TOPIC || 'tidb-cdc-topic';
createTopic(topic);
