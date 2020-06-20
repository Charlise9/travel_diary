const fs = require("fs").promises;
const path = require("path");
const sharp = require("sharp");
const uuid = require("uuid");

const { format } = require("date-fns");

function formatDateToDB(date) {
  return format(new Date(date), "yyyy-MM-dd HH:mm:ss");
}
// Definimos directorio de subida de imágenes
const imageUploadPath = path.join(__dirname, process.env.UPLOADS_DIR);

async function processAndSaveImage(uploadedImage) {
  // Creamos el directorio (con recursive: true por si hay subdirectorios y así no da error)
  await fs.mkdir(imageUploadPath, { recursive: true });

  // Leer la imagen que se subió

  const image = sharp(uploadedImage.data);

  const imageInfo = await image.metadata();

  // Cambiarle el tamaño si es necesario

  if (imageInfo.width > 1000) {
    image.resize(1000);
  }

  // Guardar la imagen en un directorio de subidas
  const imageFileName = `${uuid.v4()}.jpg`;
  await image.toFile(path.join(imageUploadPath, imageFileName));

  // Devolver el nombre con el que fue guardada
  return imageFileName;
}

async function deleteUpload(uploadedImage) {
  await fs.unlink(path.join(imageUploadPath, uploadedImage));
}

module.exports = {
  formatDateToDB,
  processAndSaveImage,
  deleteUpload,
};
