const { getConnection } = require("../../db");
const { randomString, sendMail, generateError } = require("../../helpers");

const {
  recoverUserPasswordSchema,
} = require("../../validators/userValidators");

async function recoverUserPassword(req, res, next) {
  let connection;

  try {
    connection = await getConnection();

    await recoverUserPasswordSchema.validateAsync(req.body);

    const { email } = req.body;

    // Comprobar que hay un usuario con id 12
    const [current] = await connection.query(
      `
      SELECT id
      FROM users
      WHERE email=?
    `,
      [email]
    );

    if (current.length === 0) {
      throw generateError(
        `No hay ningún usuario con email ${email} en la base de datos`,
        404
      );
    }

    // Introducir en la fila del usuario un código aleatorio
    const recoverCode = randomString(40);

    await connection.query(
      `
      UPDATE users
      SET passwordUpdateCode=?
      WHERE email=?
    `,
      [recoverCode, email]
    );

    // Enviar ese código por email
    try {
      await sendMail({
        email: email,
        title: "Código de reseteo de tu password",
        content: `
          Alguién solicitó una recuperación de tu contraseña, este es el código que tienes que usar:
          ${recoverCode}

          Si no fuiste tu quien solicitó esta recuperación, ignora este correo. Nada cambió.
        `,
      });
    } catch (error) {
      throw generateError("Error de envío de mail", 500);
    }

    // Responder al usuario
    res.send({
      status: "ok",
      message:
        "Se envió un email a la cuenta asociada con el usuario un email con instrucciones",
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
}

module.exports = recoverUserPassword;
