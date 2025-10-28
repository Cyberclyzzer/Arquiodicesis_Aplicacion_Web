import Joi from 'joi';

const base = {
  TipoDocumentoID: Joi.number().integer().required(),
  OficinaRegistroID: Joi.number().integer().optional().allow(null),
  OficinaRegistroTexto: Joi.string().max(150).optional().allow('', null),
  FechaEmision: Joi.date().iso().required(),
  FechaOtorgamiento: Joi.date().iso().allow(null),
  TipoDocumentoOtro: Joi.string().allow('', null),
  DatosAsiento: Joi.string().allow('', null),
  CondicionesEspeciales: Joi.string().allow('', null),
  Observaciones: Joi.string().allow('', null),
  ValorContrato: Joi.number().allow(null),
  MonedaContrato: Joi.string().max(10).allow('', null),
  PlazoVigencia: Joi.string().max(200).allow('', null),
  Codigo: Joi.string().allow('', null),
  CodigoEstado: Joi.string().required(),
  CodigoMunicipio: Joi.string().required(),
  CodigoParroquia: Joi.string().required(),
  NombreEstado: Joi.string().allow('', null),
  NombreMunicipio: Joi.string().allow('', null),
  NombreParroquia: Joi.string().allow('', null),
  Prefijo: Joi.string().allow('', null).custom((value, helpers) => {
    if (!value || value === '') return value;
    // Si no está vacío, validar formato
    const regex = /^[VEJGP]-\d{1,15}$/;
    if (!regex.test(value)) {
      return helpers.error('any.invalid', { message: 'Formato inválido. Use Prefijo- + 1 a 15 dígitos (ej: V-123, E-987654) o sólo dígitos (ej: 123456)' });
    }
    return value;
  }),
  Identificacion: Joi.string().allow('', null)
};

export const createDocumentoSchema = Joi.object(base).custom((val, helpers) => {
  if (!val.OficinaRegistroID && !val.OficinaRegistroTexto) {
    return helpers.error('any.custom', { message: 'Debe proporcionar OficinaRegistroTexto o OficinaRegistroID' });
  }
  if (val.ValorContrato != null && val.MonedaContrato == null) {
    return helpers.error('any.custom', { message: 'Debe indicar MonedaContrato cuando ValorContrato tiene valor' });
  }
  return val;
});

export const updateDocumentoSchema = createDocumentoSchema;
