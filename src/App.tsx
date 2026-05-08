// src/App.tsx
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import LoginForm from "./components/login/login";
import RegisterForm from "./components/register/register";
import Inicio from "./components/inicio/inicio";
import PrivateRoute from "./components/privateRoute";
import Navbar from "./components/navbar/navbar";
import Juego from "./components/juego/juego";

function Layout() {
  const location = useLocation();
  // Ocultamos el Navbar en login y register
  const hideNavbar = location.pathname === "/" || location.pathname === "/register";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route
          path="/inicio"
          element={
            <PrivateRoute>
              <Inicio />
            </PrivateRoute>
          }
        />
        <Route
          path="/juego/:id"
          element={
            <PrivateRoute>
              <Juego />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}
