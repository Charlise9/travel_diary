const { getConnection } = require("../../db");
const { processAndSaveImage, formatDateToDB } = require("../../helpers");

async function editEntry(req, res, next) {
  let connection;

  try {
    connection = await getConnection();

    // Sacamos los datos
    const { date, description, place } = req.body;
    const { id } = req.params;

    // Comprobar que la entrada que queremos editar exista en la base de datos
    const [current] = await connection.query(
      `
    SELECT id, date, description, place, image
    FROM diary
    WHERE id=?
  `,
      [id]
    );

    if (current.length === 0) {
      const error = new Error(
        `La entrada con id ${id} no existe en la base de datos`
      );
      error.httpStatus = 404;
      throw error;
    }

    const [currentEntry] = current;

    let savedImageFileName;
    // Procesar la imagen si existe
    if (req.files && req.files.image) {
      try {
        // Procesar y guardar imagen
        savedImageFileName = await processAndSaveImage(req.files.image);
      } catch (error) {
        const imageError = new Error(
          "No se pudo procesar la imagen. Inténtalo de nuevo"
        );
        imageError.httpStatus = 400;
        throw imageError;
      }
    } else {
      savedImageFileName = currentEntry.image;
    }

    // Ejecutar la query de edición de la entrada
    await connection.query(
      `
      UPDATE diary SET date=?, place=?, description=?, image=?, lastUpdate=NOW()
      WHERE id=?
    `,
      [formatDateToDB(date), place, description, savedImageFileName, id]
    );

    // Devolver resultados
    res.send({
      status: "ok",
      data: {
        id,
        date,
        place,
        description,
      },
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
}

module.exports = editEntry;
