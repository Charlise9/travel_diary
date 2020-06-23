const { getConnection } = require("../../db");

async function getEntryVotes(req, res, next) {
  let connection;

  try {
    connection = await getConnection();

    const { id } = req.params;

    // Ejecutar query para sacar lista de votos

    const [votes] = await connection.query(
      `
      SELECT vote, date, user_id
      FROM diary_votes
      WHERE entry_id=?
      `,
      [id]
    );

    res.send({
      status: "ok",
      data: votes,
    });

    // Devolver la lista en la respuesta
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
}

module.exports = getEntryVotes;
