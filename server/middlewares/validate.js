const AppError = require('../utils/AppError');

/**
 * Generic Joi validation middleware.
 * Usage: validate({ body: schema, params: schema, query: schema })
 * Validated (and defaulted/converted) values replace the originals.
 */
const validate = (schemas) => (req, res, next) => {
  for (const [part, schema] of Object.entries(schemas)) {
    const { error, value } = schema.validate(req[part], { abortEarly: false, stripUnknown: true });
    if (error) {
      return next(AppError.badRequest('Validation failed', error.details.map((d) => d.message)));
    }
    if (part === 'query') {
      // req.query is a getter in newer Express versions; mutate in place.
      Object.keys(req.query).forEach((k) => delete req.query[k]);
      Object.assign(req.query, value);
    } else {
      req[part] = value;
    }
  }
  return next();
};

module.exports = validate;
