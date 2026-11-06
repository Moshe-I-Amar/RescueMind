const express = require('express');
const catalog = require('../../domain/catalog');
const { TOURNIQUET_MINUTES, VITAL_INPUTS } = require('../../domain/vitalsAssessment');

/** Read-only clinical vocabulary for clients (labels, options, MARCH actions). */
function createCatalogRouter() {
  const router = express.Router();
  const payload = {
    priorities: catalog.PRIORITIES,
    statuses: catalog.STATUSES,
    mechanisms: catalog.MECHANISMS,
    injuryTypes: catalog.INJURY_TYPES,
    bodyLocations: catalog.BODY_LOCATIONS,
    severities: catalog.SEVERITIES,
    avpu: catalog.AVPU,
    march: catalog.MARCH,
    tourniquetMinutes: TOURNIQUET_MINUTES,
    vitalInputs: VITAL_INPUTS,
  };

  router.get('/', (req, res) => res.json({ status: 'success', data: payload }));
  return router;
}

module.exports = createCatalogRouter;
