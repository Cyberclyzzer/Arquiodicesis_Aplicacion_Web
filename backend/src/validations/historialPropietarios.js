import Joi from 'joi';

export const createHistorialPropietarioSchema = Joi.object({
  BienID: Joi.number().integer().required(),
  ParteID: Joi.number().integer().required(),
  DocumentoID: Joi.number().integer().required(),
  FechaRegistro: Joi.date().iso().allow(null)
});
export const updateHistorialPropietarioSchema = createHistorialPropietarioSchema;
