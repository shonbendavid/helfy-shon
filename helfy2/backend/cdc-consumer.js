const { Kafka } = require('kafkajs');
const log4js = require('log4js');

log4js.configure({
  appenders: { console: { type: 'console' } },
  categories: { default: { appenders: ['console'], level: 'info' } },
});
const logger = log4js.getLogger();

const kafka = new Kafka({
  clientId: 'cdc-consumer',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'cdc-group' });

async function run() {
  await consumer.connect();
  await consumer.subscribe({ topic: process.env.KAFKA_TOPIC || 'tidb-cdc-topic', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const change = JSON.parse(message.value.toString());

        logger.info({
          timestamp: new Date().toISOString(),
          operation: change.type, // e.g. insert, update, delete
          database: change.database,
          table: change.table,
          data: change.data,
        });
      } catch (err) {
        logger.error({ event: 'cdc_consumer_error', error: err.toString() });
      }
    },
  });
}

run().catch(err => {
  logger.error({ event: 'cdc_consumer_fail', error: err.toString() });
  process.exit(1);
});
