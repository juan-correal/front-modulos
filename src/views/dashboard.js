import { fetchAPI } from '../api.js';
import { navigateTo } from '../main.js';


export const renderDashboard = async (container) => {
  container.className = "container-fluid p-0 bg-light";
  
  // Base layout with sidebar
  container.innerHTML = `
    <div class="d-flex w-100">
      <!-- Sidebar -->
      <aside class="sidebar d-none d-md-flex flex-column p-4" style="width: 280px; position: sticky; top: 0;">
        <h3 class="fw-bold mb-5" style="color: var(--bs-primary)">Vitalis MedOS</h3>
        
        <nav class="nav flex-column mb-auto">
          <a class="nav-link active px-3 py-2" href="#/dashboard">
            <span style="font-size:1.1rem;margin-right:8px">📊</span> Panel Principal
          </a>
          <a class="nav-link px-3 py-2 text-muted" href="#/medicos">
            <span style="font-size:1.1rem;margin-right:8px">👨‍⚕️</span> Lista de Médicos
          </a>
          <a class="nav-link px-3 py-2 text-muted" href="#/recetas">
            <span style="font-size:1.1rem;margin-right:8px">📝</span> Recetas
          </a>
        </nav>
        
        <div class="mt-auto">
           <button class="btn btn-light w-100 text-start text-danger border-0" style="background:#fff" id="logout-btn">
             Cerrar Sesión
           </button>
        </div>
      </aside>
      
      <!-- Main Content -->
      <main class="flex-grow-1 p-4 p-md-5">
         <div class="d-flex justify-content-between align-items-center mb-5">
            <div>
              <h1 class="h2 fw-bold" style="color:#191c1d">Panel Médico</h1>
              <p class="text-muted">Resumen analítico en tiempo real</p>
            </div>
            <div class="d-flex gap-3">
              <button class="btn btn-primary px-4 py-2">+ Nueva Receta</button>
            </div>
         </div>
         
         <div id="dashboard-content">
            <div class="d-flex justify-content-center p-5">
               <div class="spinner-border text-primary" role="status"></div>
            </div>
         </div>
      </main>
    </div>
  `;

  document.getElementById('logout-btn').addEventListener('click', async () => {
    await fetchAPI('/auth/logout', { method: 'POST' });
    navigateTo('/login');
  });

  const loadData = async () => {
    const [medsRes, nocheRes, espeRes] = await Promise.all([
      fetchAPI('/dashboards/reporte-medicinas'),
      fetchAPI('/dashboards/reporte-turno-noche'),
      fetchAPI('/dashboards/reporte-especialidades')
    ]);

    const content = document.getElementById('dashboard-content');
    
    // Abstract API Responses securely
    const rawMeds = medsRes.data && Array.isArray(medsRes.data) ? medsRes.data : [];
    const rawNoche = nocheRes.data && Array.isArray(nocheRes.data) ? nocheRes.data : [];
    const rawEspe = espeRes.data && Array.isArray(espeRes.data) ? espeRes.data : [];

    content.innerHTML = `
      <div class="row g-4 mb-5">
        <div class="col-12 col-md-4">
          <div class="card-premium p-4">
             <div class="d-flex justify-content-between align-items-center">
                <div>
                   <p class="text-muted small fw-semibold mb-1">Medicinas Prescritas</p>
                   <h3 class="fw-bold mb-0">${rawMeds.length}</h3>
                </div>
                <div class="stat-icon primary">💊</div>
             </div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="card-premium p-4">
             <div class="d-flex justify-content-between align-items-center">
                <div>
                   <p class="text-muted small fw-semibold mb-1">Doctores Turno Noche</p>
                   <h3 class="fw-bold mb-0">${rawNoche.length}</h3>
                </div>
                <div class="stat-icon primary">🌙</div>
             </div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="card-premium p-4">
             <div class="d-flex justify-content-between align-items-center">
                <div>
                   <p class="text-muted small fw-semibold mb-1">Especialidades Activas</p>
                   <h3 class="fw-bold mb-0">${rawEspe.length}</h3>
                </div>
                <div class="stat-icon primary">🩺</div>
             </div>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-12 col-lg-8">
           <div class="card-premium p-4 h-100">
             <h5 class="fw-bold mb-4" style="color:#191c1d">Prescripciones por Médico</h5>
             <!-- Fixed height for the chart container -->
             <div style="position: relative; height:300px; width:100%">
               <canvas id="chartMedicinas"></canvas>
             </div>
           </div>
        </div>
        <div class="col-12 col-lg-4">
           <div class="card-premium p-4 h-100">
             <h5 class="fw-bold mb-4" style="color:#191c1d">Distribución de Especialidades</h5>
             <div style="position: relative; height:300px; width:100%">
               <canvas id="chartEspecialidades"></canvas>
             </div>
           </div>
        </div>
      </div>
    `;

    // Gráfico de Barras: Medicinas por Doctor
    if (rawMeds.length > 0) {
      const ctx = document.getElementById('chartMedicinas').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          // Extraemos los nombres de los doctores mapeando el objeto de Prisma (depende de cómo venga del backend)
          labels: rawMeds.map(m => m.doctor?.nombre || m.nombre_doctor || 'Médico'),
          datasets: [{
            label: 'Total Medicinas',
            // Buscamos el count de medicinas en la relación
            data: rawMeds.map(m => m.total_medicinas || (m._count ? m._count.medicinas : 1)),
            backgroundColor: '#40E0D0',
            borderRadius: 6
          }]
        },
        options: {
           responsive: true,
           maintainAspectRatio: false,
           plugins: { legend: { display: false } },
           scales: { 
             y: { beginAtZero: true, grid: { borderDash: [2, 4], color: '#eef0f2' }, border: {display: false} }, 
             x: { grid: { display: false }, border: {display: false} } 
           }
        }
      });
    }

    // Gráfico de Dona: Especialidades
    if (rawEspe.length > 0) {
      const ctx2 = document.getElementById('chartEspecialidades').getContext('2d');
      new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: rawEspe.map(e => e.nombre || e.especialidad || 'Esp'),
          datasets: [{
            data: rawEspe.map(e => e._count ? e._count.medicos : e.doctores_registrados || 1),
            backgroundColor: ['#00A79D', '#40E0D0', '#5eddd2', '#191c1d', '#bacac6'],
            borderWidth: 0
          }]
        },
        options: {
          responsive:true,
          maintainAspectRatio: false,
          cutout: '75%',
          plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, usePointStyle: true, padding: 20 } } }
        }
      });
    }
  };

  loadData();
};
