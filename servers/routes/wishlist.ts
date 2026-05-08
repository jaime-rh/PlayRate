import { Router } from "express";
import * as mysql from "mysql2/promise";

const router = Router();

// Pool de conexión a MySQL (Igual que en tus otros archivos)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

/**
 * 📌 POST /api/wishlist
 * Añade un juego a la lista de deseados
 */
router.post("/", async (req, res) => {
  const { user_id, game_api_id } = req.body;

  // Validaciones básicas: solo necesitamos estos dos IDs
  if (!user_id || !game_api_id) {
    return res.status(400).json({ error: "Faltan datos obligatorios (user_id o game_api_id)" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO wishlist (user_id, game_api_id) VALUES (?, ?)",
      [user_id, game_api_id]
    );

    res.status(201).json({
      message: "✅ Añadido a la lista de deseados",
      id: (result as any).insertId
    });
  } catch (error: any) {
    console.error("Error en wishlist:", error);

    // Manejo del mismo error de duplicado (Unique Constraint)
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Este juego ya está en tu lista de deseados" });
    }

    res.status(500).json({ error: "❌ Error al añadir a deseados" });
  }
});

/**
 * 📌 DELETE /api/wishlist
 * Elimina un juego de la lista de deseados
 */
router.delete("/", async (req, res) => {
  const { user_id, game_api_id } = req.body;

  try {
    await pool.query(
      "DELETE FROM wishlist WHERE user_id = ? AND game_api_id = ?",
      [user_id, game_api_id]
    );
    res.json({ message: "🗑️ Eliminado de deseados" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar" });
  }
});


/**
 * 📌 GET /api/wishlist/:user_id
 * Obtiene todos los IDs de juegos en la wishlist de un usuario
 */
router.get("/:user_id", async (req, res) => {
  const { user_id } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT game_api_id FROM wishlist WHERE user_id = ?",
      [user_id]
    );
    
    // Convertimos el resultado [ {game_api_id: 12}, {game_api_id: 45} ] 
    // en un array simple [12, 45] que es lo que espera el frontend
    const ids = (rows as any[]).map(row => row.game_api_id);
    
    res.json(ids);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener la wishlist" });
  }
});


export default router;