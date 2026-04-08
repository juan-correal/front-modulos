import { fetchAPI } from '../api.js';
import { navigateTo } from '../main.js';

export const renderLogin = (container) => {
  container.className = "d-flex align-items-center justify-content-center min-vh-100 bg-light";
  container.innerHTML = `
    <div class="row w-100 mx-0 justify-content-center">
      <div class="col-12 col-md-8 col-lg-5 col-xl-4">
        
        <div class="card-premium p-4 p-md-5">
           <div class="text-center mb-4">
             <h2 class="fw-bold mb-1" style="color: var(--bs-primary)">Vitalis MedOS</h2>
             <p class="text-muted">Inicia sesión en tu cuenta</p>
           </div>
           
           <div id="login-alert" class="alert alert-danger d-none" role="alert"></div>

           <form id="login-form">
              <div class="mb-3">
                 <label class="form-label text-muted small fw-semibold">Nombre de Usuario</label>
                 <input type="text" class="form-control form-control-lg border-0" style="background:#f3f4f5" id="username" required placeholder="admin_user" value="admin">
              </div>
              <div class="mb-4">
                 <label class="form-label text-muted small fw-semibold">Contraseña</label>
                 <input type="password" class="form-control form-control-lg border-0" style="background:#f3f4f5" id="password" required placeholder="••••••••" value="secreta123">
              </div>
              <div class="d-grid">
                <button type="submit" class="btn btn-primary btn-lg">Ingresar al Sistema</button>
              </div>
           </form>
        </div>

      </div>
    </div>
  `;

  const form = document.getElementById('login-form');
  const alertBox = document.getElementById('login-alert');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const btn = form.querySelector('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Cargando...';
    btn.disabled = true;

    const res = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    btn.innerHTML = originalText;
    btn.disabled = false;

    if (res.ok) {
      navigateTo('/dashboard');
    } else {
      alertBox.textContent = res.data?.mensaje || 'Error al iniciar sesión. Verifique sus credenciales.';
      alertBox.classList.remove('d-none');
    }
  });
};
