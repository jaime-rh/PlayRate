import { Router } from "express";
import * as mysql from "mysql2/promise";

const router = Router();

// Pool de conexión a MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// 🔹 Test de conexión
pool.query("SELECT 1")
  .then(() => console.log("✅ Conexión MySQL OK"))
  .catch(err => console.error("❌ Error conexión:", err));

/**
 * 📌 POST /api/game-ratings
 * Guarda el rating y comentario de un juego
 */
router.post("/", async (req, res) => {
  const { user_id, game_api_id, rating, comment } = req.body;

  // Validaciones básicas
  if (!user_id || !game_api_id || rating === undefined) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  if (rating < 0 || rating > 100) {
    return res.status(400).json({ error: "El rating debe estar entre 0 y 100" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO game_ratings (user_id, game_api_id, rating, comment) VALUES (?, ?, ?, ?)",
      [user_id, game_api_id, rating, comment || null]
    );

    res.status(201).json({
      message: "✅ Rating guardado",
      id: (result as any).insertId
    });
  } catch (error: any) {
    console.error(error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "El usuario ya calificó este juego" });
    }

    res.status(500).json({ error: "❌ Error al guardar rating" });
  }
});

export default router;
