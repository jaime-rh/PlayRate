// src/components/LoginForm.tsx
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import "./login.css";

interface LoginData {
  email: string;
  password: string;
}

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginData>({ email: "", password: "" });
  const navigate = useNavigate(); 

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

            console.log(data.token);

      if (data.token) {
        localStorage.setItem("token", data.token);
        alert("✅ Sesión iniciada correctamente");

        // 👇 redirige al componente Inicio
        navigate("/inicio"); 
      } else {
        alert("❌ " + data.error);
      }
    } catch (error) {
      alert("❌ Error de conexión con el servidor");
    }
  };

  return (
    <div className="login-container">
      {/* Mitad izquierda: imagen */}
      <div className="login-left">
        <img src="/fondoLogReg.jpg" className="login-image" />
      </div>

      {/* Mitad derecha: formulario */}
      <div className="login-right">
        <form onSubmit={handleSubmit} className="login-form">
          <p className="placer-login">¡Siempre es un placer verte aquí!</p>   
          <p className="titulo-login">Inicia sesión</p>

          <div className="form-group">
            <p>Email:</p>
            <input
              type="email"
              name="email"
              placeholder="LaGuitarricaDePaco@gmail.com..."
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <p>Contraseña:</p>
            <input
              type="password"
              name="password"
              placeholder="TocoLaGuitarra123..."
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <button type="submit" className="form-button-login">
            ACCEDER
          </button>
          <p className="Yatienes-login">
            No tienes una cuenta? <Link to="/register">Registrate</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
