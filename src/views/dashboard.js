import { fetchAPI } from "../api.js";
import { navigateTo } from "../main.js";

export const renderDashboard = async (container, user) => {
  container.className = "container-fluid p-0 bg-light";

  const generateTemplate = (data) => {
    const { rawMeds, rawNoche, rawEspe } = data;
    const now = new Date().toLocaleString('es-ES');
    const totalMedicinas = rawMeds.reduce((sum, m) => sum + m.totalMedicinas, 0);
    const totalMedicos = rawEspe.reduce((sum, e) => sum + e.cantidad, 0);

    return `
      <div id="report-template" style="padding: 40px; font-family: 'Inter', sans-serif; color: #333; background: #fff;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #00A79D; padding-bottom: 20px; margin-bottom: 30px;">
          <div>
            <h1 style="margin: 0; color: #00A79D; font-size: 28px;">Vitalis MedOS</h1>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Reporte Ejecutivo de Gestión Médica</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-weight: bold;">Fecha de Emisión</p>
            <p style="margin: 5px 0 0 0; color: #666;">${now}</p>
          </div>
        </div>

        <div style="margin-bottom: 40px;">
          <h2 style="font-size: 20px; margin-bottom: 15px;">Resumen de Operaciones</h2>
          <p style="line-height: 1.6; color: #444;">
            El presente documento detalla el estado actual de la gestión médica en la plataforma Vitalis MedOS. 
            A continuación se presentan las métricas clave obtenidas de la base de datos en tiempo real, 
            incluyendo la distribución de especialidades y el rendimiento de prescripciones por el personal médico activo.
          </p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px;">
          <div style="padding: 20px; border: 1px solid #eee; border-radius: 8px; background: #fdfdfd; text-align: center;">
            <p style="margin: 0; color: #666; font-size: 13px; font-weight: 600; text-transform: uppercase;">Medicinas Prescritas</p>
            <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; color: #00A79D;">${totalMedicinas}</p>
          </div>
          <div style="padding: 20px; border: 1px solid #eee; border-radius: 8px; background: #fdfdfd; text-align: center;">
            <p style="margin: 0; color: #666; font-size: 13px; font-weight: 600; text-transform: uppercase;">Médicos Turno Noche</p>
            <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; color: #00A79D;">${rawNoche.length}</p>
          </div>
          <div style="padding: 20px; border: 1px solid #eee; border-radius: 8px; background: #fdfdfd; text-align: center;">
            <p style="margin: 0; color: #666; font-size: 13px; font-weight: 600; text-transform: uppercase;">Especialidades Activas</p>
            <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; color: #00A79D;">${rawEspe.length}</p>
          </div>
          <div style="padding: 20px; border: 1px solid #eee; border-radius: 8px; background: #fdfdfd; text-align: center;">
            <p style="margin: 0; color: #666; font-size: 13px; font-weight: 600; text-transform: uppercase;">Total Médicos</p>
            <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; color: #00A79D;">${totalMedicos}</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; margin-bottom: 40px;">
          <div>
            <h3 style="font-size: 16px; margin-bottom: 20px; text-align: center;">Distribución por Especialidad</h3>
            <div style="height: 250px; display: flex; align-items: center; justify-content: center; background: #f9f9f9; border-radius: 8px;">
              <img id="pdf-chart-1" style="max-height: 100%; max-width: 100%; object-fit: contain;" />
            </div>
          </div>
          <div>
            <h3 style="font-size: 16px; margin-bottom: 20px; text-align: center;">Medicinas Prescritas por Médico</h3>
            <div style="height: 250px; display: flex; align-items: center; justify-content: center; background: #f9f9f9; border-radius: 8px;">
              <img id="pdf-chart-2" style="max-height: 100%; max-width: 100%; object-fit: contain;" />
            </div>
          </div>
        </div>

        <div style="font-size: 12px; color: #999; text-align: center; margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px;">
          Este reporte es generado de manera automática por el sistema Vitalis MedOS. 
          Confidencial y de uso exclusivo administrativo.
        </div>
      </div>
    `;
  };

  window.downloadReporte = (data) => {
    const btn = document.getElementById("btn-download");
    const originalText = btn.innerHTML;
    btn.innerHTML = "⏳ Generando PDF...";

    const printContainer = document.createElement('div');
    printContainer.style.position = 'absolute';
    printContainer.style.left = '-9999px';
    printContainer.style.top = '-9999px';
    printContainer.innerHTML = generateTemplate(data);
    document.body.appendChild(printContainer);

    const chart1Img = document.getElementById('chartEspecialidades').toDataURL('image/png');
    const chart2Img = document.getElementById('chartMedicinas').toDataURL('image/png');

    setTimeout(() => {
      document.getElementById('pdf-chart-1').src = chart1Img;
      document.getElementById('pdf-chart-2').src = chart2Img;

      const opt = {
        margin: 0,
        filename: `Reporte_Vitalis_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      };

      window.html2pdf().set(opt).from(document.getElementById("report-template")).save().then(() => {
        btn.innerHTML = originalText;
        document.body.removeChild(printContainer);
      });
    }, 500);
  };

  container.innerHTML = `
    <div class="d-flex w-100">
      <aside class="sidebar d-none d-md-flex flex-column p-4" style="width: 280px; position: sticky; top: 0;">
        <div class="mb-5">
          <h3 class="fw-bold mb-1" style="color: var(--bs-primary)">Vitalis MedOS</h3>
          <p class="text-muted small">Rol: ${user.roles?.nombre_rol || 'Usuario'}</p>
        </div>
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

      <main class="flex-grow-1 p-4 p-md-5">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="h2 fw-bold" style="color:#191c1d">Bienvenido, ${user.nombre_completo || user.username}</h1>
            <p class="text-muted">Resumen analítico de gestión</p>
          </div>
          <button class="btn btn-primary px-4 py-2" id="btn-download">
            ⬇️ Descargar Reporte PDF
          </button>
        </div>

        <div id="dashboard-content">
          <div class="d-flex justify-content-center p-5">
            <div class="spinner-border text-primary" role="status"></div>
          </div>
        </div>
      </main>
    </div>
  `;

  document.getElementById("logout-btn").addEventListener("click", async () => {
    await fetchAPI("/auth/logout", { method: "POST" });
    navigateTo("/login");
  });

  const loadData = async () => {
    const [medsRes, nocheRes, espeRes] = await Promise.all([
      fetchAPI("/dashboards/reporte-medicinas"),
      fetchAPI("/dashboards/reporte-turno-noche"),
      fetchAPI("/dashboards/reporte-especialidades"),
    ]);

    const content = document.getElementById("dashboard-content");

    // medsRes.data  → [{ medico: string, totalMedicinas: number }]
    // nocheRes.data → [{ nombre_medico, especialidad, turno }]
    // espeRes.data  → [{ especialidad: string, cantidad: number }]
    const rawMeds  = Array.isArray(medsRes.data)  ? medsRes.data  : [];
    const rawNoche = Array.isArray(nocheRes.data) ? nocheRes.data : [];
    const rawEspe  = Array.isArray(espeRes.data)  ? espeRes.data  : [];

    const totalMedicinas = rawMeds.reduce((sum, m) => sum + m.totalMedicinas, 0);
    const totalMedicos   = rawEspe.reduce((sum, e) => sum + e.cantidad, 0);

    document.getElementById("btn-download").onclick = () =>
      window.downloadReporte({ rawMeds, rawNoche, rawEspe });

    content.innerHTML = `
      <div class="row g-4 mb-4">
        <div class="col-12 col-md-3">
          <div class="card-premium p-4 border h-100 bg-white">
            <p class="text-muted small fw-semibold mb-1">Medicinas Prescritas</p>
            <h3 class="fw-bold mb-0">${totalMedicinas}</h3>
          </div>
        </div>
        <div class="col-12 col-md-3">
          <div class="card-premium p-4 border h-100 bg-white">
            <p class="text-muted small fw-semibold mb-1">Doctores Turno Noche</p>
            <h3 class="fw-bold mb-0">${rawNoche.length}</h3>
          </div>
        </div>
        <div class="col-12 col-md-3">
          <div class="card-premium p-4 border h-100 bg-white">
            <p class="text-muted small fw-semibold mb-1">Especialidades Activas</p>
            <h3 class="fw-bold mb-0">${rawEspe.length}</h3>
          </div>
        </div>
        <div class="col-12 col-md-3">
          <div class="card-premium p-4 border h-100 bg-white">
            <p class="text-muted small fw-semibold mb-1">Total Médicos</p>
            <h3 class="fw-bold mb-0">${totalMedicos}</h3>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-12 col-lg-5">
          <div class="card-premium p-4 border h-100 bg-white">
            <h5 class="fw-bold mb-4" style="color:#191c1d">Distribución de Especialidades</h5>
            <div style="position:relative; height:300px; width:100%">
              <canvas id="chartEspecialidades"></canvas>
            </div>
          </div>
        </div>
        <div class="col-12 col-lg-7">
          <div class="card-premium p-4 border h-100 bg-white">
            <h5 class="fw-bold mb-4" style="color:#191c1d">Medicinas Prescritas por Médico</h5>
            <div style="position:relative; height:300px; width:100%">
              <canvas id="chartMedicinas"></canvas>
            </div>
          </div>
        </div>
        <div class="col-12">
          <div class="card-premium p-4 border bg-white">
            <h5 class="fw-bold mb-4" style="color:#191c1d">Médicos en Turno Noche</h5>
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="text-muted small text-uppercase">
                  <tr>
                    <th>Nombre</th>
                    <th>Especialidad</th>
                    <th>Turno</th>
                  </tr>
                </thead>
                <tbody>
                  ${rawNoche.length === 0
                    ? `<tr><td colspan="3" class="text-center py-3 text-muted">Sin médicos en turno noche</td></tr>`
                    : rawNoche.map(m => `
                        <tr>
                          <td class="fw-semibold">${m.nombre_medico}</td>
                          <td>
                            <span class="badge bg-light text-primary border border-primary">
                              ${m.especialidad || 'General'}
                            </span>
                          </td>
                          <td class="text-muted text-capitalize">${m.turno}</td>
                        </tr>
                      `).join('')
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    new window.Chart(
      document.getElementById("chartEspecialidades").getContext("2d"),
      {
        type: "pie",
        data: {
          labels: rawEspe.map(e => e.especialidad),
          datasets: [{
            data: rawEspe.map(e => e.cantidad),
            backgroundColor: ["#00A79D", "#40E0D0", "#5eddd2", "#191c1d", "#bacac6"],
            borderWidth: 1,
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

    new window.Chart(
      document.getElementById("chartMedicinas").getContext("2d"),
      {
        type: "bar",
        data: {
          labels: rawMeds.map(m => m.medico),
          datasets: [{
            label: "Medicinas",
            data: rawMeds.map(m => m.totalMedicinas),
            backgroundColor: "#00A79D",
            borderRadius: 4,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } },
          },
        },
      }
    );
  };

  loadData();
};