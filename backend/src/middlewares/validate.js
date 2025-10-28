import Joi from 'joi';

// Middleware to validate request bodies against a Joi schema
export default function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: false });
    if (error) {
      const details = error.details.map(d => d.message).join(', ');
      return res.status(400).json({ error: details });
    }
    next();
  };
}
