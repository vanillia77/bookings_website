const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../middleware/auth");


router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe obligatoires" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const finalRole = role === "admin" ? "admin" : "user";

  db.run(
    `INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)`,
    [name || "", email, hashed, finalRole],
    function (err) {
      if (err) return res.status(400).json({ message: "Email déjà utilisé" });
      res.json({ id: this.lastID, role: finalRole });
    }
  );
});

// ✅ LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email et mot de passe obligatoires" });
  }

  db.get(`SELECT * FROM users WHERE email=?`, [email], async (err, user) => {
    if (err) return res.status(500).json(err);
    if (!user) return res.status(401).json({ message: "Identifiants invalides" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: "Identifiants invalides" });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  });
});

module.exports = router;
