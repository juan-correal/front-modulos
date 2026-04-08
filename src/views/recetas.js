import { fetchAPI } from "../api.js";

export const renderRecetas = async (container, user) => {
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
          <a class="nav-link px-3 py-2 text-muted" href="#/medicos">
            <span style="font-size:1.1rem;margin-right:8px">👨‍⚕️</span> Lista de Médicos
          </a>
          <a class="nav-link active px-3 py-2" href="#/recetas">
            <span style="font-size:1.1rem;margin-right:8px">📝</span> Recetas
          </a>
        </nav>
      </aside>

      <main class="flex-grow-1 p-4 p-md-5">
        <div class="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 class="h2 fw-bold" style="color:#191c1d">Historial de Recetas</h1>
            <p class="text-muted">Registro de medicamentos prescritos</p>
          </div>
          ${isAlt ? '<button class="btn btn-primary px-4 py-2" data-bs-toggle="modal" data-bs-target="#recetaModal">+ Nueva Receta</button>' : ""}
        </div>

        <!-- Chart -->
        <div class="card-premium p-4 border bg-white mb-4">
          <h5 class="fw-bold mb-4" style="color:#191c1d">Medicamentos Prescritos por Médico</h5>
          <div style="position:relative; height:240px; width:100%">
            <canvas id="chartRecetas"></canvas>
          </div>
        </div>

        <!-- Tabla -->
        <div class="card-premium p-4 border bg-white">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="text-muted small text-uppercase">
                <tr>
                  <th>Folio</th>
                  <th>Médico Asignado</th>
                  <th>Especialidad</th>
                  <th>Cantidad Med.</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody id="recetas-tbody">
                <tr><td colspan="5" class="text-center py-4">
                  <span class="spinner-border text-primary"></span>
                </td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>

    ${isAlt ? `
    <div class="modal fade" id="recetaModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold">Registrar Nueva Receta</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body p-4">
            <form id="form-receta">
              <div class="mb-3">
                <label class="form-label text-muted small fw-semibold">Seleccionar Médico</label>
                <select class="form-select border-0 bg-light" id="r-medico" required>
                  <option value="">Cargando médicos...</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label text-muted small fw-semibold">Cantidad de Medicamentos</label>
                <input type="number" class="form-control border-0 bg-light" id="r-cantidad" min="1" required placeholder="Ej: 5">
              </div>
              <div class="mb-4">
                <label class="form-label text-muted small fw-semibold">Fecha de Receta</label>
                <input type="date" class="form-control border-0 bg-light" id="r-fecha">
              </div>
              <button type="submit" class="btn btn-primary w-100 py-2">Guardar Receta</button>
            </form>
          </div>
        </div>
      </div>
    </div>
    ` : ""}
  `;

  const tbody = document.getElementById("recetas-tbody");
  const medicoSelect = document.getElementById("r-medico");
  let chartRecetas = null;

  const loadDoctors = async () => {
    if (!medicoSelect) return;
    const res = await fetchAPI("/medicos");
    if (res.ok && res.data) {
      medicoSelect.innerHTML = '<option value="">-- Elige un médico --</option>';
      res.data.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m.id_medico;
        opt.textContent = m.nombre_medico;
        medicoSelect.appendChild(opt);
      });
    } else {
      medicoSelect.innerHTML = '<option value="">Error al cargar médicos</option>';
    }
  };
const loadData = async () => {
  try {
    const res = await fetchAPI("/recetas");

    if (!res.ok || !res.data) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">
        Error al cargar recetas: ${res.message || "Sin respuesta del servidor"}
      </td></tr>`;
      return;
    }

    const recetas = res.data;

    tbody.innerHTML = recetas.length === 0
      ? '<tr><td colspan="5" class="text-center py-4 text-muted">No hay recetas registradas</td></tr>'
      : recetas.map(r => `
          <tr>
            <td class="text-muted fw-bold">#${r.id_receta}</td>
            <td class="fw-semibold" style="color:#191c1d">${r.medico?.nombre_medico || "Desconocido"}</td>
            <td>
              <span class="badge bg-light text-primary border border-primary">
                ${r.medico?.especialidad || "General"}
              </span>
            </td>
            <td class="fw-bold">${r.cantidad_med || 0}</td>
            <td class="text-muted">
              ${new Date(r.fecha_receta || Date.now()).toLocaleDateString("es-ES")}
            </td>
          </tr>
        `).join('');

    const porMedico = recetas.reduce((acc, r) => {
      const nombre = r.medico?.nombre_medico || "Desconocido";
      acc[nombre] = (acc[nombre] || 0) + (r.cantidad_med || 0);
      return acc;
    }, {});

    if (chartRecetas) chartRecetas.destroy();
    chartRecetas = new window.Chart(
      document.getElementById("chartRecetas").getContext("2d"),
      {
        type: "bar",
        data: {
          labels: Object.keys(porMedico),
          datasets: [{
            label: "Medicamentos",
            data: Object.values(porMedico),
            backgroundColor: "#00A79D",
            borderRadius: 4,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
        },
      }
    );

  } catch (err) {
    console.error("Error en loadData recetas:", err);
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">
      Error inesperado: ${err.message}
    </td></tr>`;
  }
};

  if (isAlt) {
    const formReceta = document.getElementById("form-receta");
    formReceta.addEventListener("submit", async (e) => {
      e.preventDefault();
      const res = await fetchAPI("/recetas", {
        method: "POST",
        body: JSON.stringify({
          id_medico:    document.getElementById("r-medico").value,
          cantidad_med: document.getElementById("r-cantidad").value,
          fecha_receta: document.getElementById("r-fecha").value || undefined,
        }),
      });

      if (res.ok) {
        window.bootstrap.Modal.getInstance(document.getElementById("recetaModal")).hide();
        formReceta.reset();
        await loadData();
      } else {
        alert("Error: " + (res.message || "No se pudo guardar la receta"));
      }
    });

    await loadDoctors();
  }

  await loadData();
};