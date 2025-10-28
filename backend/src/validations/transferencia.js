import Joi from 'joi';

export const createTransferenciaSchema = Joi.object({
  BienID: Joi.number().integer().required(),
  DocumentoOrigenID: Joi.number().integer().required(),
  DocumentoDestinoID: Joi.number().integer().required(),
  FechaTransferencia: Joi.date().iso().required(),
});

export const updateTransferenciaSchema = createTransferenciaSchema;
