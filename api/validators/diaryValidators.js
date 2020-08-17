const Joi = require("@hapi/joi");
const { generateError } = require("../helpers");

// Valida nueva entrada en el diario
const newEntrySchema = Joi.object().keys({
  place: Joi.string()
    .min(3)
    .max(100)
    .required()
    .error(
      generateError(
        "El campo place debe existir y ser mayor de 2 caracteres",
        400
      )
    ),
  description: Joi.string().max(10000),
});

// Valida la edición de una entrada en el diario
const editEntrySchema = Joi.object().keys({
  place: Joi.string()
    .min(3)
    .max(100)
    .required()
    .error(
      generateError(
        "El campo place debe existir y ser mayor de 2 caracteres",
        400
      )
    ),
  description: Joi.string()
    .max(10000)
    .required()
    .error(
      generateError(
        "El campo description debe existir y ser menos de 10000 caracteres",
        400
      )
    ),
  date: Joi.string()
    .required()
    .error(generateError("El campo date debe existir", 400)),
});

// Valida el voto de una entrada en el diario
const voteEntrySchema = Joi.object().keys({
  vote: Joi.number()
    .min(1)
    .max(5)
    .required()
    .error(
      generateError(
        "El campo voto debe existir y tener un valor entre 1 y 5 (incluídos)",
        400
      )
    ),
});

module.exports = {
  newEntrySchema,
  editEntrySchema,
  voteEntrySchema,
};
