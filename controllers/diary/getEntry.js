const { getConnection } = require("../../db");

async function getEntry(req, res, next) {
  let connection;

  try {
    connection = await getConnection();

    const { id } = req.params;

    const [result] = await connection.query(
      `
        SELECT diary.*, AVG(diary_votes.vote) AS voteAverage
        FROM diary
            LEFT JOIN diary_votes
            ON diary.id = diary_votes.entry_id
        WHERE diary.id=?
        `,
      [id]
    );

    if (!result[0].id) {
      const error = new Error("Entry not found");
      error.httpStatus = 404;
      throw error;
    }

    res.send({
      status: "ok",
      data: result[0],
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
}

module.exports = getEntry;
