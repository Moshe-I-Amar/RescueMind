const { randomUUID } = require('crypto');

/**
 * In-memory implementation of the casualty repository.
 * Same contract as mongoCasualtyRepository; used for tests and demo mode.
 * Returns deep copies so callers can never mutate stored state.
 */
function createMemoryCasualtyRepository() {
  const store = new Map();
  let sequence = 0;

  const copy = (value) => (value ? structuredClone(value) : null);

  const mutate = (id, fn) => {
    const current = store.get(id);
    if (!current) return null;
    fn(current);
    current.updatedAt = new Date();
    return copy(current);
  };

  return {
    async list({ status } = {}) {
      return [...store.values()].filter((c) => !status || c.status === status).map(copy);
    },

    async getById(id) {
      return copy(store.get(id));
    },

    async create(data) {
      const now = new Date();
      const casualty = {
        treatments: [],
        vitals: [],
        injuries: [],
        ...data,
        id: randomUUID(),
        number: ++sequence,
        createdAt: now,
        updatedAt: now,
      };
      store.set(casualty.id, casualty);
      return copy(casualty);
    },

    async update(id, fields) {
      return mutate(id, (c) => Object.assign(c, fields));
    },

    async addTreatment(id, treatment) {
      return mutate(id, (c) => c.treatments.push({ ...treatment, id: randomUUID() }));
    },

    async removeTreatment(id, treatmentId) {
      return mutate(id, (c) => {
        c.treatments = c.treatments.filter((t) => t.id !== treatmentId);
      });
    },

    async addVitals(id, vitals) {
      return mutate(id, (c) => c.vitals.push({ ...vitals, id: randomUUID() }));
    },
  };
}

module.exports = createMemoryCasualtyRepository;
