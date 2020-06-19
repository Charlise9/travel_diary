require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");

const listEntries = require("./controllers/diary/listEntries");
const getEntry = require("./controllers/diary/getEntry");
const newEntry = require("./controllers/diary/newEntry");

const app = express();

// Middlewares iniciales
// Log de peticiones a la consola
app.use(morgan("dev"));
// Procesado de body tipo json
app.use(bodyParser.json());
// Procesado de body tipo form-data
app.use(fileUpload());

// API / CRUD (create, read, update, delete) / entidades / endpoint

// LIstar múltiples entradas del diario de viajes (HECHO)
// GET - /entries
app.get("/entries", listEntries); // Esto es un endpoint

// Mostrar una sóla entrada del diario
// GET - /entries/:id
app.get("/entries/:id", getEntry); // Esto es un endpoint

// Crear una nueva entrada del diario
// Post - /entries
app.post("/entries", newEntry);

// Editar una entrada del diario
// PUT - /entries/:id

// Borrar una entrada del diario
// DELETE - /entries/:id

// Votar una entrada
// Ver votos de una entrada

// Middleware finales

// Error middleware
app.use((error, req, res, next) => {
  console.log(error);
  res.status(error.httpStatus || 500).send({
    status: "error",
    message: error.message,
  });
});

// Nof found
app.use((req, res) => {
  res.status(404).send({
    status: "error",
    message: "Not found",
  });
});

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`API funcionando en http://localhost:${port}`);
});
