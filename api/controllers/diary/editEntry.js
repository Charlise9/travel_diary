const { getConnection } = require("../../db");
const {
  processAndSaveImage,
  formatDateToDB,
  deleteUpload,
  generateError,
} = require("../../helpers");

const { editEntrySchema } = require("../../validators/diaryValidators");

async function editEntry(req, res, next) {
  let connection;

  try {
    connection = await getConnection();

    await editEntrySchema.validateAsync(req.body);

    // Sacamos los datos
    const { date, description, place } = req.body;
    const { id } = req.params;

    // Seleccionar datos actuales de la entrada
    const [current] = await connection.query(
      `
    SELECT id, date, description, place, image, user_id
    FROM diary
    WHERE id=?
  `,
      [id]
    );

    const [currentEntry] = current;

    if (currentEntry.user_id !== req.auth.id && req.auth.role !== "admin") {
      throw generateError("No tienes permisos para editar esta entrada", 403);
    }

    let savedImageFileName;
    // Procesar la imagen si existe
    if (req.files && req.files.image) {
      try {
        // Procesar y guardar imagen
        savedImageFileName = await processAndSaveImage(req.files.image);
        if (currentEntry.image) await deleteUpload(currentEntry.image);
      } catch (error) {
        throw generateError(
          "No se pudo procesar la imagen. Inténtalo de nuevo",
          400
        );
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
        image: savedImageFileName,
      },
    });
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
}

module.exports = editEntry;
