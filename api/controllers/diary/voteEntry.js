const { getConnection } = require("../../db");

const { voteEntrySchema } = require("../../validators/diaryValidators");
const { generateError } = require("../../helpers");

async function voteEntry(req, res, next) {
  let connection;

  try {
    connection = await getConnection();

    await voteEntrySchema.validateAsync(req.body);

    const { id } = req.params;
    const { vote } = req.body;

    // Comprobar que la entrada existe y si no dar un 404
    const [entry] = await connection.query(
      `
      SELECT id, place
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
      throw generateError(
        `Ya votaste la entrada "${entry[0].place}" con tu usuario`,
        403
      );
    }

    // Guardar el voto en la base de datos
    await connection.query(
      `
      INSERT INTO diary_votes(entry_id, vote, date, user_id, lastUpdate)
      VALUES(?, ?, UTC_TIMESTAMP, ?, UTC_TIMESTAMP)
    `,
      [id, vote, req.auth.id]
    );

    res.send({
      status: "ok",
      message: `Se guardó el voto (${vote} puntos) a la entrada ${id}`,
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
}

module.exports = voteEntry;
