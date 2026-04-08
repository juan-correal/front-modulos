import './libs/bootstrap/bootstrap.min.css';
import './libs/bootstrap/bootstrap.bundle.min.js';
import './style.css';
import { renderLogin } from './views/login.js';
import { renderDashboard } from './views/dashboard.js';
import { renderMedicos } from './views/medicos.js';
import { renderRecetas } from './views/recetas.js';
import { fetchAPI } from './api.js';

const app = document.getElementById('app');

export const navigateTo = async (route) => {
  window.location.hash = route;
  app.innerHTML = '';
  
  if (route !== '/login') {
    // Verificar si estamos autenticados para entrar a cualquier otra area
    const res = await fetchAPI('/auth/perfil');
    if (!res.ok) {
      return navigateTo('/login');
    }
    
    if (route === '/dashboard') renderDashboard(app);
    else if (route === '/medicos') renderMedicos(app);
    else if (route === '/recetas') renderRecetas(app);
    else renderDashboard(app); // fallback to dashboard if authenticated
  } else {
    // Login es por defecto
    renderLogin(app);
  }
};

window.addEventListener('hashchange', () => {
  const path = window.location.hash.replace('#', '') || '/login';
  // En un esquema real, hay que validar que no re-cargemos si ya estamos ahí, pero por simplicidad:
  navigateTo(path);
});

// Init
const initialRoute = window.location.hash.replace('#', '') || '/login';
navigateTo(initialRoute);
