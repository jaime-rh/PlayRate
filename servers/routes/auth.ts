import { Router } from "express";
import * as mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();

// Pool de conexión a MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

pool.query("SELECT 1")
  .then(() => console.log("✅ Conexión MySQL OK"))
  .catch(err => console.error("❌ Error conexión:", err));


/**
 * 📌 Registro de usuario
 * POST /api/auth/register
 */
router.post("/register", async (req, res) => {
  const { nickName, name, birthdate, email, role, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO users (nickName, name, birthdate, email, role, password) VALUES (?, ?, ?, ?, ?, ?)",
      [nickName, name, birthdate, email, role || "client", hashedPassword]
    );

    res.status(201).json({
      message: "✅ Usuario registrado con éxito",
      userId: (result as any).insertId
    });
  } catch (error: any) {
    console.error("❌ Error al registrar:", error.sqlMessage || error);
    res.status(500).json({ error: "❌ Error al registrar usuario" });
  }
});



/**
 * 📌 Inicio de sesión
 * POST /api/auth/login
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("Intento de login para:", email+" / "+password);

  try {
    // Buscar usuario por email
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    const users = rows as any[];

    if (users.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const user = users[0];

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );


    res.json({ 
      message: "✅ Inicio de sesión exitoso", 
      token 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "❌ Error en el servidor" });
  }
});


/**
 * para aceso a rutas protegidas
 */
export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};


export default router;
