import Joi from 'joi';

export const createTipoBienSchema = Joi.object({
  Nombre: Joi.string().required(),
});
export const updateTipoBienSchema = createTipoBienSchema;
