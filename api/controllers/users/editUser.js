const { getConnection } = require("../../db");
const {
  randomString,
  sendMail,
  processAndSaveImage,
  generateError,
} = require("../../helpers");

const { editUserSchema } = require("../../validators/userValidators");

async function editUser(req, res, next) {
  let connection;

  try {
    connection = await getConnection();

    await editUserSchema.validateAsync(req.body);

    const { id } = req.params;
    const { email, name } = req.body;

    // Comprobar que el id de usuario que queremos cambiar es
    // el mismo que firma la petición o bien es admin
    if (req.auth.id !== Number(id) && req.auth.role !== "admin") {
      throw generateError("No tienes permisos para editar este usuario", 403);
    }

    // Comprobar que el usuario existe
    const [currentUser] = await connection.query(
      `
      SELECT id, email, image
      FROM users
      WHERE id=?
    `,
      [id]
    );

    if (currentUser.length === 0) {
      throw generateError(`El usuario con id ${id} no existe`, 404);
    }

    // Si mandamos imagen guardar avatar

    let savedFileName;

    if (req.files && req.files.avatar) {
      try {
        // Procesar y guardar imagen
        savedFileName = await processAndSaveImage(req.files.avatar);
      } catch (error) {
        throw generateError(
          "No se pudo procesar la imagen. Inténtalo de nuevo",
          400
        );
      }
    } else {
      savedFileName = currentUser[0].image;
    }

    // Si el email es diferente al actual comprobar que no existe en la base de datos
    if (email !== currentUser[0].email) {
      const [existingEmail] = await connection.query(
        `
        SELECT id
        FROM users
        WHERE email=? 
      `,
        [email]
      );

      if (existingEmail.length > 0) {
        throw generateError(
          "Ya existe un usuario con este email en la base de datos",
          403
        );
      }

      // Verificamos de nuevo el email recibido
      const registrationCode = randomString(40);
      const validationURL = `${process.env.PUBLIC_HOST}/users/validate/${registrationCode}`;

      //Enviamos la url anterior por mail
      try {
        await sendMail({
          email,
          title:
            "Cambiaste tu email en la aplicación diario de viajes. Por favor valida de nuevo",
          content: `Para validar tu nuevo email en la app diario de viajes haz click aquí: ${validationURL}`,
        });
      } catch (error) {
        throw generateError("Error en el envío de mail", 500);
      }

      await connection.query(
        `
        UPDATE users 
        SET name=?, email=?, lastUpdate=UTC_TIMESTAMP, lastAuthUpdate=UTC_TIMESTAMP, active=false, registrationCode=?, image=?
        WHERE id=?
      `,
        [name, email, registrationCode, savedFileName, id]
      );

      // Dar una respuesta
      res.send({
        status: "ok",
        message: "Usuario actualizado. Mira tu email para activarlo de nuevo.",
      });
    } else {
      // Actualizar usuario en la base de datos
      await connection.query(
        `
      UPDATE users 
      SET name=?, email=?, image=?, lastUpdate=UTC_TIMESTAMP
      WHERE id=?
    `,
        [name, email, savedFileName, id]
      );

      // Dar una respuesta
      res.send({
        status: "ok",
        message: "Usuario actualizado",
      });
    }
  } catch (error) {
    next(error);
  } finally {
    if (connection) connection.release();
  }
}

module.exports = editUser;
