const { getConnection } = require("../../db");
const { processAndSaveImage, generateError } = require("../../helpers");

const { newEntrySchema } = require("../../validators/diaryValidators");

async function newEntry(req, res, next) {
  let connection;
  try {
    connection = await getConnection();

    await newEntrySchema.validateAsync(req.body);

    // Sacar de req.body los datos que necesitio
    const { place, description } = req.body;

    // Comprobar que no no existe una entrada con el mismo place
    const [existingEntry] = await connection.query(
      `
      SELECT id 
      FROM diary
      WHERE place=?
    `,
      [place]
    );

    if (existingEntry.length > 0) {
      throw generateError(
        "Ya existe una entrada en la base de datos con ese campo place",
        409
      );
    }

    let savedImageFileName;

    // Procesar la imagen si está en el body
    if (req.files && req.files.image) {
      try {
        // Procesar y guardar imagen
        savedImageFileName = await processAndSaveImage(req.files.image);
      } catch (error) {
        throw generateError(
          "No se pudo procesar la imagen. Inténtalo de nuevo",
          400
        );
      }
    }

    // Ejecutar la query
    const [result] = await connection.query(
      `
      INSERT INTO diary(date, place, description, image, lastUpdate, user_id)
      VALUES(UTC_TIMESTAMP,?,?,?,UTC_TIMESTAMP, ?)
      `,
      [place, description, savedImageFileName, req.auth.id]
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
