const { Casualty, Counter } = require('../api/models/Casualty');

/** MongoDB implementation of the casualty repository (see memoryCasualtyRepository for the contract). */
function createMongoCasualtyRepository() {
  const plain = (doc) => (doc ? doc.toObject() : null);
  const NEW = { new: true, runValidators: true };

  async function nextNumber() {
    const counter = await Counter.findOneAndUpdate(
      { _id: 'casualty' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    return counter.seq;
  }

  return {
    async list({ status } = {}) {
      const docs = await Casualty.find(status ? { status } : {});
      return docs.map(plain);
    },

    async getById(id) {
      return plain(await Casualty.findById(id));
    },

    async create(data) {
      return plain(await Casualty.create({ ...data, number: await nextNumber() }));
    },

    async update(id, fields) {
      return plain(await Casualty.findByIdAndUpdate(id, { $set: fields }, NEW));
    },

    async addTreatment(id, treatment) {
      return plain(await Casualty.findByIdAndUpdate(id, { $push: { treatments: treatment } }, NEW));
    },

    async removeTreatment(id, treatmentId) {
      return plain(await Casualty.findByIdAndUpdate(id, { $pull: { treatments: { _id: treatmentId } } }, NEW));
    },

    async addVitals(id, vitals) {
      return plain(await Casualty.findByIdAndUpdate(id, { $push: { vitals } }, NEW));
    },
  };
}

module.exports = createMongoCasualtyRepository;
