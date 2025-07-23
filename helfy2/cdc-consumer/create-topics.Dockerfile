# cdc-consumer/create-topics.Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY create-topics.js ./
RUN npm install kafkajs

CMD ["node", "create-topics.js"]