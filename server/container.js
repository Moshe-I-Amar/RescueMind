const createMongoCasualtyRepository = require('./repositories/mongoCasualtyRepository');
const createMemoryCasualtyRepository = require('./repositories/memoryCasualtyRepository');
const createCasualtyService = require('./services/casualtyService');

const REPOSITORIES = {
  mongo: createMongoCasualtyRepository,
  memory: createMemoryCasualtyRepository,
};

/** Composition root: wires concrete implementations based on configuration. */
function createContainer({ dataStore = 'mongo' } = {}) {
  const createRepository = REPOSITORIES[dataStore];
  if (!createRepository) throw new Error(`Unknown DATA_STORE "${dataStore}"`);

  const casualtyService = createCasualtyService({ repository: createRepository() });
  return { casualtyService, usesMongo: dataStore === 'mongo' };
}

module.exports = createContainer;
