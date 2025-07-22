require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const initDb = require('./init-db');
const authRoutes = require('./routes/auth');

const { sendMessage } = require('./producer');
const { startConsumer } = require('./consumer');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:8080' }));
app.use(bodyParser.json());

app.use('/api', authRoutes);

// Example endpoint using Kafka to send message
app.post('/api/register', async (req, res) => {
  const user = req.body; // Assume user contains email, password, etc.

  // TODO: Your user registration logic here (insert into DB)

  try {
    await sendMessage('user-registrations', { email: user.email, timestamp: Date.now() });
    res.status(201).json({ message: 'User registered and event sent to Kafka' });
  } catch (err) {
    console.error('Error sending Kafka message:', err);
    res.status(500).json({ error: 'Registration succeeded but failed to send Kafka event' });
  }
});

// Start DB and server
initDb()
  .then(() => {
    console.log('Database initialized successfully.');

    // Start Kafka consumer to listen for user-registrations topic
    startConsumer('user-registrations', (data) => {
      console.log('Received Kafka event on user-registrations:', data);
      // You can add processing logic here if needed
    }).catch(console.error);

    app.listen(PORT, () => {
      console.log(`Backend listening at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
