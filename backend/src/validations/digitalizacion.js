import Joi from 'joi';


export const createDigitalizacionSchema = Joi.object({
  DocumentoID: Joi.number().integer().required(),
  FechaDigitalizacion: Joi.date().iso().required(),
  ResponsableNombre: Joi.string().allow('', null),
  ResponsableIdentificacion: Joi.string().allow('', null),
  PalabraClave: Joi.string().allow('', null).optional(),
  UbicacionFisica: Joi.string().allow('', null),
  Codigo: Joi.string().allow('', null),
  ResponsablePrefijo: Joi.string().valid('V','E','J','G','P').allow('', null),
  ResponsableIdentificacion: Joi.string().allow('', null)
});
export const updateDigitalizacionSchema = createDigitalizacionSchema;
