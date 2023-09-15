const getUsers = require("./src/middleware/auth");

const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const app = express();
const fs = require("fs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: "R3p7qB9sT5zW",
    resave: false,
    saveUninitialized: true,
  })
);

const isAuthenticated = (req, res, next) => {
  const isAuth = req.session.user ? true : false;
  if (!isAuth) {
    return res.redirect("/login");
  }
  next();
};

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/src/models/home.html");
});

app.get("/home", (req, res) => {
  res.sendFile(__dirname + "/src/models/home.html");
});

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/src/models/login.html");
});

app.get("/admin", isAuthenticated, (req, res) => {
  res.sendFile(__dirname + "/src/models/admin.html");
});

app.get("/articles", (req, res) => {
  try {
    const arquivo = fs.readFileSync("./src/data/articles.json", "utf-8");
    const parsedArquivo = JSON.parse(arquivo);
    res.json(parsedArquivo.articles);
  } catch (error) {
    res.status(500).json({ error: "Erro ao ler o arquivo JSON" });
  }
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const users = getUsers();

  const user = users.find(
    (user) => user.username === username && user.password === password
  );

  console.log(user);

  if (!user) {
    res.redirect("/login");
  } else {
    req.session.user = user.name;
    res.redirect("/admin");
  }
});

app.get("/logout", (req, res) => {
  req.session.user = null;
  res.redirect("/login.html");
});

app.use((req, res) => {
  res.status(404).sendFile(__dirname + "/src/models/404.html");
});

app.listen(3000, () => {
  console.log(`Servidor rodando em http://localhost:3000`);
});
