import Joi from 'joi';

export const createRolSchema = Joi.object({
  Nombre: Joi.string().required(),
});
export const updateRolSchema = createRolSchema;
