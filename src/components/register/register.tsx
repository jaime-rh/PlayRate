// src/components/RegisterForm.tsx
import { useState, type ChangeEvent, type FormEvent } from "react";
import "./Register.css";

interface RegisterData {
  nickName: string;
  name: string;
  birthdate: string;
  email: string;
  password: string;
}

export default function RegisterForm() {
  const [formData, setFormData] = useState<RegisterData>({
    nickName: "",
    name: "",
    birthdate: "",
    email: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const response = await fetch("http://localhost:3001/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    const data = await response.json();
    alert(data.message || data.error);
  };

  return (
    <div className="register-container">
      {/* Mitad izquierda: imagen */}
      <div className="register-left">
        <img src="/fondoLogReg.jpg" className="register-image" />
      </div>

      {/* Mitad derecha: formulario */}
      <div className="register-right">
        <form onSubmit={handleSubmit} className="register-form">
          <p className="titulo">¡Regístrate gratis!</p>
          <div className="form-group">
            <p>Nickname:</p>
            <input
              name="nickName"
              placeholder="Paquito..."
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <p>Nombre:</p>
            <input
              name="name"
              placeholder="Paco de Lucía..."
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <p>Fecha de nacimiento:</p>
            <input
              type="date"
              name="birthdate"
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

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

          <button type="submit" className="form-button">
            REGISTRATE
          </button>
          <p className="Yatienes">Ya tienes una cuenta? <a href="/">Inicia sesión</a></p>
        </form>
      </div>
    </div>
  );

}
