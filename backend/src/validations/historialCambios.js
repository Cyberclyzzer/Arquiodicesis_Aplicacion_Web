import Joi from 'joi';

export const createHistorialCambioSchema = Joi.object({
  DocumentoID: Joi.number().integer().required(),
  UsuarioID: Joi.number().integer().required(),
  CampoModificado: Joi.string().required(),
  ValorAnterior: Joi.any().required(),
  ValorNuevo: Joi.any().required(),
});
export const updateHistorialCambioSchema = createHistorialCambioSchema;
