const { getConnection } = require("../../db");
const { deleteUpload } = require("../../helpers");

async function deleteUser(req, res, next) {
  let connection;
  try {
    connection = await getConnection();

    const { id } = req.params;

    // Compruebo que existe el usuario
    const [current] = await connection.query(
      `
      SELECT id, image
      FROM users
      WHERE id=?
    `,
      [id]
    );

    if (current.length === 0) {
      const error = new Error(
        `No existe ningún usuario con id ${id} en la base de datos`
      );
      error.httpStatus = 404;
      throw error;
    }

    if (current[0].image) {
      await deleteUpload(current[0].image);
    }

    await connection.query(
      `
      DELETE FROM users
      WHERE id=?
    `,
      [id]
    );

    res.send({
      status: "ok",
      message: `El usuario con id ${id} fue borrado`,
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
}

module.exports = deleteUser;
