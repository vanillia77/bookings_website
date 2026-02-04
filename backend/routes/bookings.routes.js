const express = require("express");
const router = express.Router();
const db = require("../db");

/* =========================
   CREATE booking
========================= */
router.post("/", (req, res) => {
  const { title, description, date, time } = req.body;

  if (!title || !date || !time) {
    return res.status(400).json({ message: "Données invalides" });
  }

  db.run(
    `INSERT INTO bookings (title, description, date, time, status)
     VALUES (?, ?, ?, ?, 'pending')`,
    [title, description || "", date, time],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ id: this.lastID });
    }
  );
});

/* =========================
   READ bookings
========================= */
router.get("/", (req, res) => {
  db.all(
    `SELECT * FROM bookings ORDER BY id DESC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

/* =========================
   UPDATE booking
========================= */
router.put("/:id", (req, res) => {
  const { title, description, date, time } = req.body;

  db.run(
    `UPDATE bookings
     SET title=?, description=?, date=?, time=?
     WHERE id=?`,
    [title, description, date, time, req.params.id],
    function (err) {
     if (err) return res.status(500).json({ message: err.message });

      res.json({ updated: this.changes });
    }
  );
});

/* =========================
   DELETE booking
========================= */
router.delete("/:id", (req, res) => {
  db.run(
    `DELETE FROM bookings WHERE id=?`,
    [req.params.id],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ deleted: this.changes });
    }
  );
});

/* =========================
   CONFIRM booking (optionnel)
========================= */
router.patch("/:id/confirm", (req, res) => {
  db.run(
    `UPDATE bookings SET status='confirmed' WHERE id=?`,
    [req.params.id],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ confirmed: true });
    }
  );
});

module.exports = router;
