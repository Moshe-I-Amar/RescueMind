const Joi = require('joi');
const catalog = require('../../domain/catalog');
const { VITAL_INPUTS } = require('../../domain/vitalsAssessment');

/** Joi string restricted to the codes of a catalog list. */
const oneOf = (list) => Joi.string().valid(...catalog.codesOf(list));

const injury = Joi.object({
  type: oneOf(catalog.INJURY_TYPES).required(),
  location: oneOf(catalog.BODY_LOCATIONS).required(),
  severity: oneOf(catalog.SEVERITIES).default('moderate'),
});

const casualtyFields = {
  name: Joi.string().trim().max(80).allow(''),
  priority: oneOf(catalog.PRIORITIES),
  status: oneOf(catalog.STATUSES),
  mechanism: oneOf(catalog.MECHANISMS),
  injuryTime: Joi.date().iso(),
  injuries: Joi.array().items(injury).max(20),
};


module.exports = {
  idParams: Joi.object({ id: Joi.string().required() }),

  treatmentParams: Joi.object({
    id: Joi.string().required(),
    treatmentId: Joi.string().required(),
  }),

  listQuery: Joi.object({ status: oneOf(catalog.STATUSES) }),

  createCasualty: Joi.object({
    ...casualtyFields,
    priority: casualtyFields.priority.required(),
  }),

  updateCasualty: Joi.object(casualtyFields).min(1),

  addTreatment: Joi.object({
    action: Joi.string().required(),
    site: Joi.string(),
    note: Joi.string().trim().max(300).allow(''),
    performedAt: Joi.date().iso(),
    confirm: Joi.boolean().default(false),
  }),

  addVitals: Joi.object({
    ...Object.fromEntries(
      Object.entries(VITAL_INPUTS).map(([field, { min, max }]) => [field, Joi.number().min(min).max(max)])
    ),
    avpu: oneOf(catalog.AVPU),
    recordedAt: Joi.date().iso(),
  }).or(...Object.keys(VITAL_INPUTS), 'avpu'),
};
