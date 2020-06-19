const { getConnection } = require("../../db");

async function listEntries(req, res, next) {
  let connection;

  try {
    connection = await getConnection();
    // Sacamos las posibles opciones del querystring:
    // search: para listar solo las entradas que contengan su valor en place o description
    // order: para ordenar el listado por voteaverage, place o date
    // direction: para la dirección de la ordenación desc o asc
    const { search, order, direction } = req.query;

    let orderBy;
    const orderDirection =
      (direction && direction.toLowerCase()) === "desc" ? "DESC" : "ASC";

    switch (order) {
      case "voteAverage":
        orderBy = "voteAverage";
        break;
      case "place":
        orderBy = "place";
        break;
      default:
        orderBy = "date";
    }

    let queryResults;
    console.log(search);
    if (search) {
      queryResults = await connection.query(
        `   
            SELECT diary.id, diary.date, diary.place,
              (SELECT AVG(vote) FROM diary_votes WHERE entry_id=diary.id) AS voteAverage
            FROM diary
            WHERE place LIKE ? OR description LIKE ?
            ORDER BY ${orderBy} ${orderDirection}
        `,
        [`%${search}%`, `%${search}%`]
      );
    } else {
      queryResults = await connection.query(
        `SELECT diary.id, diary.date, diary.place,
          (SELECT AVG(vote) FROM diary_votes WHERE entry_id=diary.id) AS voteAverage
        FROM diary
        ORDER BY ${orderBy} ${orderDirection}`
      );
    }

    const [result] = queryResults;

    res.send({
      status: "ok",
      data: result,
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
}

module.exports = listEntries;
