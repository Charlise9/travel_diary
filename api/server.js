require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");

const entryExists = require("./middlewares/entryExists");
const isUser = require("./middlewares/isUser");
const isAdmin = require("./middlewares/isAdmin");

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
const getUser = require("./controllers/users/getUser");
const editUser = require("./controllers/users/editUser");
const deleteUser = require("./controllers/users/deleteUser");
const editUserPassword = require("./controllers/users/editUserPassword");
const recoverUserPassword = require("./controllers/users/recoverUserPassword");
const resetUserPassword = require("./controllers/users/resetUserPassword");

const app = express();

// Middlewares iniciales
// Log de peticiones a la consola
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

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

// Mostrar una sóla entrada del diario (HECHO)
// GET - /entries/:id
// Público
app.get("/entries/:id", entryExists, getEntry); // Esto es un endpoint

// Crear una nueva entrada del diario (HECHO)
// Post - /entries
// Sólo usuarios registrados
app.post("/entries", isUser, newEntry);

// Editar una entrada del diario (HECHO)
// PUT - /entries/:id
// Sólo usuario que creo la entrada o admin
app.put("/entries/:id", isUser, entryExists, editEntry);

// Borrar una entrada del diario (HECHO)
// DELETE - /entries/:id
// Sólo usuario que creo la entrada o admin
app.delete("/entries/:id", isUser, entryExists, deleteEntry);

// Votar una entrada (HECHO)
// POST - /entries/:id/votes
// Solo usuarios registrados
app.post("/entries/:id/votes", isUser, entryExists, voteEntry);

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

// Ver información de un usuario (HECHO)
// GET - /users/:id
// Sólo para usuarios registrados
// Pero si el usuario es el mismo o admin debería mostrar toda la información
app.get("/users/:id", isUser, getUser);

// Editar datos de usuario: email, name, avatar
// PUT - /users/:id
// Sólo el propio usuario o el usuario admin
app.put("/users/:id", isUser, editUser);

// Borrar un usuario
// DELETE - /users/:id
// Sólo el usuario admin
app.delete("/users/:id", isUser, isAdmin, deleteUser);

// Editar password de usuario
// POST - /users/:id/password
// Sólo el propio usuario o el usuario admin
app.post("/users/:id/password", isUser, editUserPassword);

// Enviar código de reset de password
// POST - /users/recover-password
// Público
app.post("/users/recover-password", recoverUserPassword);

// Resetear password de usuaro
// POST - /users/recover-password
// Público
app.post("/users/reset-password", resetUserPassword);

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
