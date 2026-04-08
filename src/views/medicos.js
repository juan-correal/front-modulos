import { fetchAPI } from '../api.js';
import { navigateTo } from '../main.js';

export const renderMedicos = async (container) => {
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
          <a class="nav-link active px-3 py-2" href="#/medicos">
            <span style="font-size:1.1rem;margin-right:8px">👨‍⚕️</span> Lista de Médicos
          </a>
          <a class="nav-link px-3 py-2 text-muted" href="#/recetas">
            <span style="font-size:1.1rem;margin-right:8px">📝</span> Recetas
          </a>
        </nav>
      </aside>
      
      <!-- Main Content -->
      <main class="flex-grow-1 p-4 p-md-5">
         <div class="d-flex justify-content-between align-items-center mb-5">
            <div>
              <h1 class="h2 fw-bold" style="color:#191c1d">Directorio Médico</h1>
              <p class="text-muted">Gestión y registro de especialistas</p>
            </div>
            <button class="btn btn-primary px-4 py-2" data-bs-toggle="modal" data-bs-target="#medicoModal">+ Agregar Médico</button>
         </div>
         
         <div class="card-premium p-4">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                 <thead class="text-muted small text-uppercase">
                    <tr>
                       <th>ID</th>
                       <th>Nombre</th>
                       <th>Especialidad</th>
                       <th>Correo</th>
                       <th>Estado</th>
                    </tr>
                 </thead>
                 <tbody id="medicos-tbody">
                    <tr><td colspan="5" class="text-center py-4"><span class="spinner-border text-primary"></span></td></tr>
                 </tbody>
              </table>
            </div>
         </div>
      </main>
    </div>

    <!-- Modal -->
    <div class="modal fade" id="medicoModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content border-0 card-premium">
          <div class="modal-header border-0 bg-light">
            <h5 class="modal-title fw-bold">Registrar Nuevo Médico</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
             <form id="form-medico">
               <div class="mb-3">
                 <label class="form-label text-muted small fw-semibold">Nombre Completo</label>
                 <input type="text" class="form-control" id="m-nombre" required>
               </div>
               <div class="mb-3">
                 <label class="form-label text-muted small fw-semibold">Especialidad</label>
                 <input type="text" class="form-control" id="m-especialidad" required>
               </div>
               <div class="mb-3">
                 <label class="form-label text-muted small fw-semibold">Correo Electrónico</label>
                 <input type="email" class="form-control" id="m-correo">
               </div>
               <button type="submit" class="btn btn-primary w-100">Guardar Médico</button>
             </form>
          </div>
        </div>
      </div>
    </div>
  `;

  const tbody = document.getElementById('medicos-tbody');

  const loadData = async () => {
    const res = await fetchAPI('/medicos');
    if (res.ok && res.data) {
       tbody.innerHTML = res.data.length === 0 ? '<tr><td colspan="5" class="text-center py-4 text-muted">No hay médicos registrados</td></tr>' : '';
       res.data.forEach(m => {
          tbody.innerHTML += `
            <tr>
              <td class="text-muted fw-bold">#${m.id_medico || m.id}</td>
              <td class="fw-semibold" style="color:#191c1d">${m.nombre}</td>
              <td><span class="badge" style="background-color:rgba(64,224,208,0.15); color:#006a64">${m.idEspecialidad?.nombre || m.especialidad_nombre || m.especialidad || 'General'}</span></td>
              <td class="text-muted">${m.correo || m.email || 'N/A'}</td>
              <td><span class="badge bg-light text-success border border-success">Activo</span></td>
            </tr>
          `;
       });
    } else {
       tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-4">Error al cargar datos</td></tr>';
    }
  };

  await loadData();
};
