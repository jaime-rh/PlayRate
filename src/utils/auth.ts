// src/utils/auth.ts

// Obtener el token guardado
export const getToken = (): string | null => {
  return localStorage.getItem("token");
};

// Guardar token
export const setToken = (token: string) => {
  localStorage.setItem("token", token);
};

// Eliminar token (logout)
export const clearToken = () => {
  localStorage.removeItem("token");
};

// Verificar si el usuario está autenticado
export const isAuthenticated = (): boolean => {
  return !!getToken();
};
