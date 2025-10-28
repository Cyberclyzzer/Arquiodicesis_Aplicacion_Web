import Joi from 'joi';

export const createRevisionSchema = Joi.object({
  DocumentoID: Joi.number().integer().required(),
  FechaRevision: Joi.date().iso().required(),
  ResponsablePrefijo: Joi.string().valid('V','E','J','G','P').allow('', null),
  ResponsableNombre: Joi.string().allow('', null),
  ResponsableCedula: Joi.string().allow('', null)
});
export const updateRevisionSchema = createRevisionSchema;
