require('dotenv').config();
const mongoose = require('mongoose');
const createApp = require('./createApp');
const createContainer = require('./container');
const seedDemo = require('./dev/seedDemo');
const startVitalsSimulator = require('./dev/vitalsSimulator');

const {
  PORT = 5000,
  MONGODB_URI = 'mongodb://localhost:27017/rescueMind',
  DATA_STORE = 'mongo',
  SEED_DEMO,
  SIMULATE_VITALS,
} = process.env;

async function main() {
  const { casualtyService, usesMongo } = createContainer({ dataStore: DATA_STORE });

  if (usesMongo) {
    mongoose
      .connect(MONGODB_URI)
      .then(() => console.log('Connected to MongoDB'))
      .catch((err) => console.error('Could not connect to MongoDB:', err.message));
  } else {
    console.log(`Using "${DATA_STORE}" data store (data is not persisted)`);
  }

  if (SEED_DEMO === 'true') await seedDemo(casualtyService);
  if (SIMULATE_VITALS === 'true') startVitalsSimulator(casualtyService);

  createApp({ casualtyService }).listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

main();
