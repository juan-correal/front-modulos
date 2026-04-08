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
    const res = await fetchAPI('/auth/perfil');
    if (!res.ok) {
      return navigateTo('/login');
    }

    const userData = res.data?.usuario || res.usuario;

    if (route === '/dashboard') renderDashboard(app, userData);
    else if (route === '/medicos') renderMedicos(app, userData);
    else if (route === '/recetas') renderRecetas(app, userData);
    else renderDashboard(app, userData); 
  } else {
    renderLogin(app);
  }
};

window.addEventListener('hashchange', () => {
  const path = window.location.hash.replace('#', '') || '/login';
  navigateTo(path);
});

// Init
const initialRoute = window.location.hash.replace('#', '') || '/login';
navigateTo(initialRoute);
