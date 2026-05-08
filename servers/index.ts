import dotenv from "dotenv"; 
dotenv.config(); //cargar variables de entorno
import express from "express";
import authRoutes from "./routes/auth";
import gameRatingsRoutes from "./routes/game-ratings";
import wishlistRoutes from "./routes/wishlist";
import cors from "cors";

const app = express();

// Habilitar CORS para permitir peticiones desde tu frontend
app.use(cors({
  origin: "http://localhost:5173", // frontend en Vite
  credentials: true
}));

// Middleware para leer JSON en el body
app.use(express.json());

// Montar rutas de autenticación
app.use("/api/auth", authRoutes);
app.use("/api/game-ratings", gameRatingsRoutes);
app.use("/api/wishlist", wishlistRoutes);

// Arrancar servidor
app.listen(3001, () => {
  console.log("✅ Servidor backend corriendo en http://localhost:3001");
});
