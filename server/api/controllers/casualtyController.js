const asyncHandler = require('../../utils/asyncHandler');

/** Thin HTTP adapter: maps requests to service calls and wraps results. */
function createCasualtyController(service) {
  const respond = (status, run) =>
    asyncHandler(async (req, res) => {
      res.status(status).json({ status: 'success', data: await run(req) });
    });

  return {
    list: respond(200, (req) => service.list(req.query)),
    get: respond(200, (req) => service.get(req.params.id)),
    create: respond(201, (req) => service.create(req.body)),
    update: respond(200, (req) => service.update(req.params.id, req.body)),
    addTreatment: respond(201, (req) => service.addTreatment(req.params.id, req.body)),
    removeTreatment: respond(200, (req) => service.removeTreatment(req.params.id, req.params.treatmentId)),
    addVitals: respond(201, (req) => service.addVitals(req.params.id, req.body)),
  };
}

module.exports = createCasualtyController;
