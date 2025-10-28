import Joi from 'joi';

export const createTipoDocumentoSchema = Joi.object({
  Nombre: Joi.string().required(),
});
export const updateTipoDocumentoSchema = createTipoDocumentoSchema;
