import Joi from 'joi';

export const createParteSchema = Joi.object({
  DocumentoID: Joi.number().integer().required(),
  TipoParte: Joi.string().valid('Otorgante','Receptor','Abogado','AbogadoOtorgante','AbogadoReceptor').required(),
  NombreParte: Joi.string().required(),
  DatosIdentificacion: Joi.string().allow('', null).optional(),
  Prefijo: Joi.string().valid('V','E','J','G','P').optional(),
}).unknown(true); // permitir campos adicionales futuros sin romper
export const updateParteSchema = createParteSchema;
