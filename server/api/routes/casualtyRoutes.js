const express = require('express');
const validate = require('../../middlewares/validate');
const schemas = require('../validation/casualtySchemas');
const createCasualtyController = require('../controllers/casualtyController');

function createCasualtyRouter(casualtyService) {
  const router = express.Router();
  const c = createCasualtyController(casualtyService);
  const byId = { params: schemas.idParams };

  router.get('/', validate({ query: schemas.listQuery }), c.list);
  router.post('/', validate({ body: schemas.createCasualty }), c.create);
  router.get('/:id', validate(byId), c.get);
  router.patch('/:id', validate({ ...byId, body: schemas.updateCasualty }), c.update);
  router.post('/:id/treatments', validate({ ...byId, body: schemas.addTreatment }), c.addTreatment);
  router.delete('/:id/treatments/:treatmentId', validate({ params: schemas.treatmentParams }), c.removeTreatment);
  router.post('/:id/vitals', validate({ ...byId, body: schemas.addVitals }), c.addVitals);

  return router;
}

module.exports = createCasualtyRouter;
