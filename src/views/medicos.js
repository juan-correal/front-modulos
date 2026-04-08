import { fetchAPI } from "../api.js";

export const renderMedicos = async (container, user) => {
  container.className = "container-fluid p-0 bg-light";

  const isAlt = user?.roles?.nombre_rol === "administrador";

  container.innerHTML = `
    <div class="d-flex w-100">
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

      <main class="flex-grow-1 p-4 p-md-5">
        <div class="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 class="h2 fw-bold" style="color:#191c1d">Directorio Médico</h1>
            <p class="text-muted">Gestión y registro de especialistas</p>
          </div>
          ${isAlt ? '<button class="btn btn-primary px-4 py-2" data-bs-toggle="modal" data-bs-target="#medicoModal">+ Agregar Médico</button>' : ""}
        </div>

        <!-- Charts -->
        <div class="row g-4 mb-4">
          <div class="col-12 col-lg-6">
            <div class="card-premium p-4 border bg-white">
              <h5 class="fw-bold mb-4" style="color:#191c1d">Médicos por Turno</h5>
              <div style="position:relative; height:220px; width:100%">
                <canvas id="chartTurnos"></canvas>
              </div>
            </div>
          </div>
          <div class="col-12 col-lg-6">
            <div class="card-premium p-4 border bg-white">
              <h5 class="fw-bold mb-4" style="color:#191c1d">Médicos por Especialidad</h5>
              <div style="position:relative; height:220px; width:100%">
                <canvas id="chartEspecialidades"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabla -->
        <div class="card-premium p-4 border bg-white">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="text-muted small text-uppercase">
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Especialidad</th>
                  <th>Turno</th>
                </tr>
              </thead>
              <tbody id="medicos-tbody">
                <tr><td colspan="4" class="text-center py-4">
                  <span class="spinner-border text-primary"></span>
                </td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>

    ${isAlt ? `
    <div class="modal fade" id="medicoModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content border-0 card-premium">
          <div class="modal-header border-0 bg-light">
            <h5 class="modal-title fw-bold">Registrar Nuevo Médico</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body p-4">
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
                <label class="form-label text-muted small fw-semibold">Turno</label>
                <select class="form-select" id="m-turno" required>
                  <option value="">-- Selecciona un turno --</option>
                  <option value="diurno">Diurno</option>
                  <option value="nocturno">Nocturno</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary w-100 py-2">Guardar Médico</button>
            </form>
          </div>
        </div>
      </div>
    </div>
    ` : ""}
  `;

  const tbody = document.getElementById("medicos-tbody");
  let chartTurnos = null;
  let chartEspe = null;

  const loadData = async () => {
    const res = await fetchAPI("/medicos");

    if (!res.ok || !res.data) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger py-4">Error al cargar datos</td></tr>';
      return;
    }

    const medicos = res.data;
    // res.data → [{ id_medico, nombre_medico, especialidad, turno }]

    // --- Tabla ---
    tbody.innerHTML = medicos.length === 0
      ? '<tr><td colspan="4" class="text-center py-4 text-muted">No hay médicos registrados</td></tr>'
      : medicos.map(m => `
          <tr>
            <td class="text-muted fw-bold">#${m.id_medico}</td>
            <td class="fw-semibold" style="color:#191c1d">${m.nombre_medico}</td>
            <td>
              <span class="badge" style="background-color:rgba(64,224,208,0.15); color:#006a64">
                ${m.especialidad || "General"}
              </span>
            </td>
            <td class="text-muted text-capitalize">${m.turno || "N/A"}</td>
          </tr>
        `).join('');

    // --- Agrupar por turno: { diurno: N, nocturno: N } ---
    const porTurno = medicos.reduce((acc, m) => {
      const t = (m.turno || "sin turno").toLowerCase();
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});

    // --- Agrupar por especialidad: { Cardiología: N, ... } ---
    const porEspe = medicos.reduce((acc, m) => {
      const e = m.especialidad || "General";
      acc[e] = (acc[e] || 0) + 1;
      return acc;
    }, {});

    // --- Chart Turnos (Doughnut) ---
    if (chartTurnos) chartTurnos.destroy();
    chartTurnos = new window.Chart(
      document.getElementById("chartTurnos").getContext("2d"),
      {
        type: "doughnut",
        data: {
          labels: Object.keys(porTurno).map(t => t.charAt(0).toUpperCase() + t.slice(1)),
          datasets: [{
            data: Object.values(porTurno),
            backgroundColor: ["#00A79D", "#191c1d", "#bacac6"],
            borderWidth: 2,
            borderColor: "#fff",
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "bottom" } },
        },
      }
    );

    // --- Chart Especialidades (Bar horizontal) ---
    if (chartEspe) chartEspe.destroy();
    chartEspe = new window.Chart(
      document.getElementById("chartEspecialidades").getContext("2d"),
      {
        type: "bar",
        data: {
          labels: Object.keys(porEspe),
          datasets: [{
            label: "Médicos",
            data: Object.values(porEspe),
            backgroundColor: "#00A79D",
            borderRadius: 4,
          }],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { beginAtZero: true, ticks: { stepSize: 1 } },
          },
        },
      }
    );
  };

  await loadData();

  if (isAlt) {
    const formMedico = document.getElementById("form-medico");
    if (formMedico) {
      formMedico.addEventListener("submit", async (e) => {
        e.preventDefault();
        const res = await fetchAPI("/medicos", {
          method: "POST",
          body: JSON.stringify({
            nombre_medico: document.getElementById("m-nombre").value,
            especialidad:  document.getElementById("m-especialidad").value,
            turno:         document.getElementById("m-turno").value,
          }),
        });

        if (res.ok) {
          window.bootstrap.Modal.getInstance(document.getElementById("medicoModal")).hide();
          formMedico.reset();
          await loadData(); // recarga tabla Y charts
        } else {
          alert("Error al guardar médico");
        }
      });
    }
  }
};