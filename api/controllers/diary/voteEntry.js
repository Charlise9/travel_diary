const { getConnection } = require("../../db");

async function voteEntry(req, res, next) {
  let connection;

  try {
    connection = await getConnection();
    const { id } = req.params;
    const { vote } = req.body;

    const userVote = parseInt(vote);

    // Comprobar que el voto es correcto
    if (userVote > 5 || userVote < 1) {
      const error = new Error("Voto incorrecto, debe ser entre 1 y 5");
      error.httpStatus = 400;
      throw error;
    }

    // Comprobar que la entrada existe y si no dar un 404
    const [entry] = await connection.query(
      `
      SELECT id
      FROM diary
      WHERE id=?
      `,
      [id]
    );

    // Comprobar que no hay ningún voto previo con mi usuario
    const [existingVote] = await connection.query(
      `
      SELECT id
      FROM diary_votes
      WHERE entry_id=? AND user_id=?
      `,
      [id, req.auth.id]
    );

    if (existingVote.length > 0) {
      const error = new Error(
        `Ya votaste la entrada ${entry[0].place} con tu usuario`
      );
      error.httpStatus = 403;
      throw error;
    }

    // Guardar el voto en la base de datos
    await connection.query(
      `
      INSERT INTO diary_votes(entry_id, vote, date, user_id, lastUpdate)
      VALUES(?,?, NOW(),?,NOW())
      `,
      [id, userVote, req.auth.id]
    );

    res.send({
      status: "ok",
      message: `Se guardó el voto (${userVote} puntos) a la entrada ${id}`,
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
}

module.exports = voteEntry;
