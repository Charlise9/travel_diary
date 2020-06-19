require("dotenv").config();

const faker = require("faker/locale/es");
const { getConnection } = require("./db");
const { formatDateToDB } = require("./helpers");
const { random } = require("lodash");

let connection;

async function main() {
  try {
    // Conseguir conexión a la base de datos
    connection = await getConnection();

    // Borrar las tablas si existen (diary, diary_votes)
    console.log("Borrando tablas");
    await connection.query("DROP TABLE IF EXISTS diary");
    await connection.query("DROP TABLE IF EXISTS diary_votes");

    // Crear las tablas de nuevo
    console.log("Creando tablas");

    await connection.query(`
      CREATE TABLE diary(
        id INTEGER PRIMARY KEY AUTO_INCREMENT,
        date DATETIME NOT NULL,
        description MEDIUMTEXT,
        place VARCHAR(200) UNIQUE NOT NULL,
        image TINYTEXT,
        lastUpdate DATETIME NOT NULL
      );
    
    `);

    await connection.query(`
        CREATE TABLE diary_votes (
          id INTEGER PRIMARY KEY AUTO_INCREMENT,
          entry_id INTEGER NOT NULL,
          vote TINYINT NOT NULL,
          date DATETIME NOT NULL,
          ip TINYTEXT NOT NULL,
          lastUpdate DATETIME NOT NULL
        );
    `);

    // Meter datos de prueba en las tablas

    console.log("Metiendo datos de prueba en diary");

    const diaryEntries = 10;

    for (let index = 0; index < diaryEntries; index++) {
      const date = formatDateToDB(faker.date.recent());

      await connection.query(`
        INSERT INTO diary(date, description, place, lastUpdate)
        VALUES("${date}", "${faker.lorem.paragraph()}", "${faker.address.city()}", NOW())
        `);
    }

    console.log("metiendo datos de prueba en diary_votes");

    const diaryVotesEntries = 100;

    for (let index = 0; index < diaryVotesEntries; index++) {
      const date = formatDateToDB(faker.date.recent());

      await connection.query(`
      INSERT INTO diary_votes(entry_id, vote, date, ip, lastUpdate)
      VALUES("${random(1, diaryEntries)}",
      "${random(1, 5)}",
      "${date}",
      "${faker.internet.ip()}",
       NOW())
      `);
    }
  } catch (error) {
    console.error(error);
  } finally {
    console.log("Todo hecho, liberando conexion");
    if (connection) connection.release();
    process.exit();
  }
}

main();
