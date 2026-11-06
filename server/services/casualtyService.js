const AppError = require('../utils/AppError');
const { ACTIONS_BY_CODE } = require('../domain/catalog');
const { toCasualtyView, toCasualtySummary, compareByUrgency } = require('../domain/casualtyView');

/**
 * Casualty use-cases. Depends only on the repository contract (DIP),
 * so storage can be swapped (Mongo / in-memory) without touching this file.
 *
 * @param {object} deps
 * @param {object} deps.repository casualty repository
 * @param {() => Date} [deps.clock] injectable clock for deterministic tests
 */
function createCasualtyService({ repository, clock = () => new Date() }) {
  const view = (casualty) => toCasualtyView(casualty, clock());

  const found = (casualty) => {
    if (!casualty) throw AppError.notFound('Casualty not found');
    return view(casualty);
  };

  /** Resolves the MARCH category and validates the site against the catalog. */
  function buildTreatment({ action, site, note, performedAt }) {
    const entry = ACTIONS_BY_CODE[action];
    if (!entry) throw AppError.badRequest(`Unknown treatment action: ${action}`);

    const allowedSites = entry.action.sites;
    if (allowedSites && !site) throw AppError.badRequest(`Action "${action}" requires a site`);
    if (site && !allowedSites) throw AppError.badRequest(`Action "${action}" does not take a site`);
    if (site && !allowedSites.some((s) => s.code === site)) {
      throw AppError.badRequest(`Invalid site "${site}" for action "${action}"`);
    }

    return {
      category: entry.category,
      action,
      ...(site ? { site } : {}),
      ...(note ? { note } : {}),
      performedAt: performedAt || clock(),
    };
  }

  return {
    async list(filter = {}) {
      const casualties = await repository.list(filter);
      return casualties.map((c) => toCasualtySummary(c, clock())).sort(compareByUrgency);
    },

    async get(id) {
      return found(await repository.getById(id));
    },

    async create(data) {
      return view(await repository.create({ status: 'active', injuryTime: clock(), ...data }));
    },

    async update(id, fields) {
      return found(await repository.update(id, fields));
    },

    async addTreatment(id, input) {
      return found(await repository.addTreatment(id, buildTreatment(input)));
    },

    async removeTreatment(id, treatmentId) {
      const casualty = await repository.getById(id);
      if (!casualty) throw AppError.notFound('Casualty not found');
      if (!casualty.treatments.some((t) => String(t.id) === String(treatmentId))) {
        throw AppError.notFound('Treatment not found');
      }
      return found(await repository.removeTreatment(id, treatmentId));
    },

    async addVitals(id, vitals) {
      return found(await repository.addVitals(id, { recordedAt: clock(), ...vitals }));
    },
  };
}

module.exports = createCasualtyService;
