import { fetchAPI } from '../api.js';
import { navigateTo } from '../main.js';

export const renderRecetas = async (container) => {
  container.className = "container-fluid p-0 bg-light";
  
  container.innerHTML = `
    <div class="d-flex w-100">
      <!-- Sidebar -->
      <aside class="sidebar d-none d-md-flex flex-column p-4" style="width: 280px; position: sticky; top: 0;">
        <h3 class="fw-bold mb-5" style="color: var(--bs-primary)">Vitalis MedOS</h3>
        <nav class="nav flex-column mb-auto">
          <a class="nav-link px-3 py-2 text-muted" href="#/dashboard">
            <span style="font-size:1.1rem;margin-right:8px">📊</span> Panel Principal
          </a>
          <a class="nav-link px-3 py-2 text-muted" href="#/medicos">
            <span style="font-size:1.1rem;margin-right:8px">👨‍⚕️</span> Lista de Médicos
          </a>
          <a class="nav-link active px-3 py-2" href="#/recetas">
            <span style="font-size:1.1rem;margin-right:8px">📝</span> Recetas
          </a>
        </nav>
      </aside>
      
      <!-- Main Content -->
      <main class="flex-grow-1 p-4 p-md-5">
         <div class="d-flex justify-content-between align-items-center mb-5">
            <div>
              <h1 class="h2 fw-bold" style="color:#191c1d">Historial de Recetas</h1>
              <p class="text-muted">Registro de medicamentos prescritos</p>
            </div>
            <button class="btn btn-primary px-4 py-2">+ Nueva Receta</button>
         </div>
         
         <div class="card-premium p-4">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                 <thead class="text-muted small text-uppercase">
                    <tr>
                       <th>Folio</th>
                       <th>Médico Asignado</th>
                       <th>Paciente</th>
                       <th>Fecha</th>
                       <th>Estado</th>
                    </tr>
                 </thead>
                 <tbody id="recetas-tbody">
                    <tr><td colspan="5" class="text-center py-4"><span class="spinner-border text-primary"></span></td></tr>
                 </tbody>
              </table>
            </div>
         </div>
      </main>
    </div>
  `;

  const tbody = document.getElementById('recetas-tbody');

  const loadData = async () => {
    const res = await fetchAPI('/recetas');
    if (res.ok && res.data) {
       tbody.innerHTML = res.data.length === 0 ? '<tr><td colspan="5" class="text-center py-4 text-muted">No hay recetas registradas</td></tr>' : '';
       res.data.forEach(r => {
          tbody.innerHTML += `
            <tr>
              <td class="text-muted fw-bold">#${r.id_receta || r.id}</td>
              <td class="fw-semibold" style="color:#191c1d">${r.medico?.nombre || 'Desconocido'}</td>
              <td>${r.paciente?.nombre || r.nombre_paciente || 'General'}</td>
              <td class="text-muted">${new Date(r.fecha_creacion || r.fecha || Date.now()).toLocaleDateString('es-ES')}</td>
              <td><span class="badge bg-light text-primary border border-primary">Emitida</span></td>
            </tr>
          `;
       });
    } else {
       tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-4">Error al cargar datos</td></tr>';
    }
  };

  await loadData();
};
