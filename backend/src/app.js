const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();


const JWT_SECRET = "DWFS_SECRET_KEY_CHANGE_ME";
const PORT = 3000;

// Middlewares
app.use(cors({ origin: "http://localhost:4200" }));
app.use(express.json());

// SQLite DB (fichier local)
const db = new sqlite3.Database("./database.sqlite");

// Création table users si n'existe pas
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'User',
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
});

// Helpers
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "2h" }
  );
}

// Middleware: protéger routes
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) return res.status(401).json({ message: "Token manquant" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // {id, email, role}
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalide" });
  }
}

// Middleware: admin uniquement
function adminMiddleware(req, res, next) {
  if (req.user?.role !== "Admin") {
    return res.status(403).json({ message: "Accès admin requis" });
  }
  next();
}

//  Route test
app.get("/", (req, res) => {
  res.send("Backend OK ");
});

// REGISTER
app.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Champs manquants" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userRole = role === "Admin" ? "Admin" : "User";

    const stmt = db.prepare(
      "INSERT INTO users (fullName, email, passwordHash, role) VALUES (?, ?, ?, ?)"
    );

    stmt.run(fullName, email, passwordHash, userRole, function (err) {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          return res.status(409).json({ message: "Email déjà utilisé" });
        }
        return res.status(500).json({ message: "Erreur serveur", error: err.message });
      }

      const user = { id: this.lastID, fullName, email, role: userRole };
      const token = generateToken(user);

      return res.status(201).json({
        message: "Inscription réussie",
        token,
        user,
      });
    });

    stmt.finalize();
  } catch (e) {
    return res.status(500).json({ message: "Erreur serveur", error: e.message });
  }
});

// LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Champs manquants" });

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, row) => {
    if (err) return res.status(500).json({ message: "Erreur serveur" });
    if (!row) return res.status(401).json({ message: "Email ou mot de passe incorrect" });

    const ok = await bcrypt.compare(password, row.passwordHash);
    if (!ok) return res.status(401).json({ message: "Email ou mot de passe incorrect" });

    const user = { id: row.id, fullName: row.fullName, email: row.email, role: row.role };
    const token = generateToken(user);

    return res.json({ message: "Connexion réussie", token, user });
  });
});

// Exemple route protégée
app.get("/me", authMiddleware, (req, res) => {
  res.json({ message: "OK", user: req.user });
});

// Exemple admin
app.get("/admin/stats", authMiddleware, adminMiddleware, (req, res) => {
  res.json({ message: "Stats admin (exemple)" });
});

app.listen(PORT, () => {
  console.log(` Backend démarré : http://localhost:${PORT}`);
});












app.get("/users", (req, res) => {
  db.all("SELECT id, fullName, email, role, createdAt FROM users", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: "Erreur serveur" });
    }
    res.json(rows);
  });
});
