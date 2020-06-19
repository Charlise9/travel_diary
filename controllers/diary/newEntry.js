const { getConnection } = require("../../db");
const { processAndSaveImage } = require("../../helpers");

async function newEntry(req, res, next) {
  let connection;
  try {
    connection = await getConnection();
    // Sacar de req.body los datos que necesito
    const { place, description } = req.body;

    // Comprobar que están todos los datos necesarios
    if (!place) {
      const error = new Error(
        "Faltan datos en la petición. El campo place es obligatorio"
      );
      error.httpStatus = 400;
      throw error;
    }

    // Comprobar que no existe una entrada con el mismo place
    const [existingEntry] = await connection.query(
      `
      SELECT id
      FROM diary
      WHERE place=?
      `,
      [place]
    );

    if (existingEntry.length > 0) {
      const error = new Error(
        "Ya existe una entrada en la base de datos con ese campo place"
      );
      error.httpStatus = 409;
      throw error;
    }

    let savedImageFileName;
    // Procesar la imagen si está en el body
    // sharp, uuid, express-fileupload
    if (req.files && req.files.image) {
      try {
        // Procesar imagen
        savedImageFileName = await processAndSaveImage(req.files.image);
      } catch (error) {
        const imageError = new Error(
          "No se pudo procesar la imagen, inténtalo de nuevo"
        );
        imageError.httpStatus = 400;
        throw imageError;
      }
    }

    // Ejecutar la query
    const [result] = await connection.query(
      `
          INSERT INTO diary(date, place, description, image, lastUpdate)
          VALUES(NOW(),?,?,?,NOW())
          `,
      [place, description, savedImageFileName]
    );

    // Devolver el resultado

    res.send({
      status: "ok",
      data: {
        id: result.insertId,
        place,
        description,
        image: savedImageFileName,
      },
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
}

module.exports = newEntry;
