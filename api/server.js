require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");

const entryExists = require("./middlewares/entryExists");
const isUser = require("./middlewares/isUser");

// Content controllers
const listEntries = require("./controllers/diary/listEntries");
const getEntry = require("./controllers/diary/getEntry");
const newEntry = require("./controllers/diary/newEntry");
const editEntry = require("./controllers/diary/editEntry");
const deleteEntry = require("./controllers/diary/deleteEntry");
const voteEntry = require("./controllers/diary/voteEntry");
const getEntryVotes = require("./controllers/diary/getEntryVotes");

// User controllers
const newUser = require("./controllers/users/newUser");
const validateUser = require("./controllers/users/validateUser");
const loginUser = require("./controllers/users/loginUser");

const app = express();

// Middlewares iniciales
// Log de peticiones a la consola
app.use(morgan("dev"));
// Procesado de body tipo json
app.use(bodyParser.json());
// Procesado de body tipo form-data
app.use(fileUpload());

// API / CRUD (create, read, update, delete) / entidades / endpoint

// ENDPOINTS DE CONTENIDO

// LIstar múltiples entradas del diario de viajes (HECHO)
// GET - /entries
// Público
app.get("/entries", listEntries); // Esto es un endpoint

// Mostrar una sóla entrada del diario
// GET - /entries/:id
// Público
app.get("/entries/:id", entryExists, getEntry); // Esto es un endpoint

// Crear una nueva entrada del diario
// Post - /entries
// Sólo usuarios registrados
app.post("/entries", isUser, newEntry);

// Editar una entrada del diario
// PUT - /entries/:id
// Sólo usuario que creo la entrada o admin
app.put("/entries/:id", isUser, entryExists, editEntry);

// Borrar una entrada del diario
// DELETE - /entries/:id
// Sólo usuario que creo la entrada o admin
app.delete("/entries/:id", entryExists, deleteEntry);

// Votar una entrada
// POST - /entries/:id/votes
// Solo usuarios registrados
app.post("/entries/:id/votes", entryExists, voteEntry);

// Ver votos de una entrada
// GET - /entries/:id/votes
// Público
app.get("/entries/:id/votes", entryExists, getEntryVotes);

// ENDPOINTS DE USUARIO

// Registro de usuarios
// POST - /users
// Público
app.post("/users", newUser);

// Validación de usuarios registrados
// GET - /users/validate/:code
// Público
app.get("/users/validate/:code", validateUser);

// Login de usuarios
// Post - /users/login
// Público
app.post("/users/login", loginUser);

// Ver información de un usuario
// GET - /users/:id
// Sólo para usuarios registrados
// Pero si el usuario es el mismo o admin debería mostrar toda la información

// Editar datos de usuario
// PUT - /users/:id
// Sólo el propio usuario o el usuario admin

// Editar password de usuario
// POST - /users/:id/password
// Sólo el propio usuario o el usuario admin

// Borrar un usuario
// DELETE - /users/:id
// Sólo el usuario admin

// Middleware finales

// Error middleware
app.use((error, req, res, next) => {
  console.error(error);

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
