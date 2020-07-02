const { getConnection } = require("../../db");
const { generateError } = require("../../helpers");

async function validateUser(req, res, next) {
  let connection;
  try {
    connection = await getConnection();
    const { code } = req.params;

    const [result] = await connection.query(
      `
      SELECT email
      FROM users
      WHERE registrationCode=?
    `,
      [code]
    );

    if (result.length === 0) {
      throw generateError(
        "No hay ningún usuario pendiente de validación con ese código",
        404
      );
    }

    // Actualizar la tabla de usuarios marcando como activo
    // el usuario que tenga el código de registro recibido
    await connection.query(
      `
      UPDATE users
      SET active=true, registrationCode=NULL
      WHERE registrationCode=?
    `,
      [code]
    );

    res.send({
      status: "ok",
      message: `Ya puedes hacer login con tu email: ${result[0].email} y tu contraseña`,
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
}

module.exports = validateUser;
