import Joi from 'joi';

export const createBienSchema = Joi.object({
  DocumentoID: Joi.number().integer().required(),
  TipoBienID: Joi.number().integer().required(),
  Descripcion: Joi.string().allow('', null),
  Caracteristicas: Joi.string().allow('', null),
  Ubicacion: Joi.string().allow('', null),
  MetrosFrenteTexto: Joi.string().allow('', null),
  MetrosFondoTexto: Joi.string().allow('', null),
  MetrosTerreno: Joi.number().allow(null),
  MetrosConstruccion: Joi.number().allow(null),
  LinderoNorte: Joi.string().allow('', null),
  LinderoSur: Joi.string().allow('', null),
  LinderoEste: Joi.string().allow('', null),
  LinderoOeste: Joi.string().allow('', null),
  Marca: Joi.string().allow('', null),
  Modelo: Joi.string().allow('', null),
  Serial: Joi.string().allow('', null),
  Placa: Joi.string().allow('', null)
  , Activo: Joi.boolean().optional()
});

export const updateBienSchema = createBienSchema;
