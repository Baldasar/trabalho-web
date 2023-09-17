const getUsers = require("./src/middleware/auth");

const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const app = express();
const fs = require("fs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
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

app.get("/users", (req, res) => {
  const users = getUsers();
  res.json(users);
});

app.post("/articles", (req, res) => {
  const getArticles = () => {
    try {
      const arquivo = fs.readFileSync("./src/data/articles.json", "utf-8");

      const parsedArquivo = JSON.parse(arquivo);

      return parsedArquivo.articles;
    } catch (error) {
      return error;
    }
  }

  const { kb_title, kb_body, kb_permalink, kb_keywords, kb_liked_count, kb_published, kb_suggestion, kb_featured, kb_author_email, kb_published_date } = req.body;

  const articles = getArticles();

  const articleExists = articles.find((article) => article.kb_permalink === kb_permalink);

  if (articleExists) {
    return res.status(400).json({ error: "Artigo já cadastrado" });
  }

  const gerarId = () => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';

    for (let i = 0; i < 12; i++) {
      const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
      id += caracteres.charAt(indiceAleatorio);
    }

    return id;

  }

  const newArticle = {
    kb_id: gerarId(),
    kb_title,
    kb_body,
    kb_permalink,
    kb_keywords,
    kb_liked_count,
    kb_published,
    kb_suggestion,
    kb_featured,
    kb_author_email,
    kb_published_date,
  };

  articles.push(newArticle);

  const saveArticles = JSON.stringify({ articles });

  fs.writeFileSync("./src/data/articles.json", saveArticles);

  res.status(201).json(newArticle);
});

app.post("/users", (req, res) => {
  const { author_name, author_email, author_user, author_pwd, author_level, author_status } = req.body;

  const users = getUsers();

  const userExists = users.find((user) => user.author_user === author_user);

  if (userExists) {
    return res.status(400).json({ error: "Usuário já cadastrado" });
  }

  const gerarId = () => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';

    for (let i = 0; i < 12; i++) {
      const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
      id += caracteres.charAt(indiceAleatorio);
    }

    return id;
  }

  const newUser = {
    author_id: gerarId(),
    author_name,
    author_email,
    author_user,
    author_pwd,
    author_level,
    author_status,
  };

  users.push(newUser);

  const saveUsers = JSON.stringify({ users });

  fs.writeFileSync("./src/data/users.json", saveUsers);

  res.status(201).json(newUser);
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const users = getUsers();

  const user = users.find(
    (user) => user.author_user === username && user.author_pwd === password
  );

  if (!user) {
    res.redirect("/login");
  } else {
    req.session.user = user.author_name;
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
