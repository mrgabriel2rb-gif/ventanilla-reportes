import './style.css';

const app = document.querySelector<HTMLDivElement>('#app')!;

// --- SISTEMA DE UI: NOTIFICACIONES Y MODALES ---
function mostrarNotificacion(mensaje: string, tipo: 'exito' | 'error' = 'exito') {
  const toast = document.createElement('div');
  toast.className = 'toast-notificacion';
  toast.style.backgroundColor = tipo === 'exito' ? 'var(--color-exito)' : 'var(--color-error)';
  toast.textContent = mensaje;
  document.body.appendChild(toast);

  // Animación de entrada
  setTimeout(() => toast.classList.add('toast-visible'), 10);
  // Animación de salida y destrucción
  setTimeout(() => {
    toast.classList.remove('toast-visible');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

function mostrarModalConfirmacion(mensaje: string, onConfirmar: () => void) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay activo';
  overlay.innerHTML = `
    <div class="modal-caja">
      <h3 style="color: var(--color-guinda); margin-top: 0;">Atención</h3>
      <p>${mensaje}</p>
      <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
        <button id="btnCancelarModal" style="padding: 8px 15px; border: 1px solid #ccc; background: white; border-radius: 4px; cursor: pointer;">Cancelar</button>
        <button id="btnConfirmarModal" style="padding: 8px 15px; background: var(--color-error); color: white; border: none; border-radius: 4px; cursor: pointer;">Sí, Eliminar</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('btnCancelarModal')!.onclick = () => overlay.remove();
  document.getElementById('btnConfirmarModal')!.onclick = () => {
    onConfirmar();
    overlay.remove();
  };
}


// --- VISTAS: LOGIN Y REGISTRO ---
function renderLogin() {
  app.innerHTML = `
    <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 400px; margin: auto;">
      <h2 style="color: var(--color-guinda); text-align: center;">Iniciar Sesión</h2>
      <form id="loginForm" style="display: flex; flex-direction: column; gap: 15px;">
        <input type="email" id="email" required style="padding: 8px;" placeholder="Correo Electrónico" />
        <input type="password" id="password" required style="padding: 8px;" placeholder="Contraseña" />
        <button type="submit" class="btn-oficial">Ingresar</button>
      </form>
      <p style="text-align: center; margin-top: 15px; font-size: 14px;">
        ¿No tienes cuenta? <a href="#" id="linkRegistro" style="color: var(--color-dorado);">Regístrate aquí</a>
      </p>
    </div>
  `;
  document.getElementById('loginForm')!.addEventListener('submit', manejarLogin);
  document.getElementById('linkRegistro')!.addEventListener('click', (e) => { e.preventDefault(); renderRegistro(); });
}

function renderRegistro() {
  app.innerHTML = `
    <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 400px; margin: auto;">
      <h2 style="color: var(--color-guinda); text-align: center;">Crear Cuenta</h2>
      <form id="registroForm" style="display: flex; flex-direction: column; gap: 15px;">
        <input type="text" id="regNombre" required style="padding: 8px;" placeholder="Nombre Completo" />
        <input type="email" id="regEmail" required style="padding: 8px;" placeholder="Correo Electrónico" />
        <input type="text" id="regTelefono" style="padding: 8px;" placeholder="Teléfono (Opcional)" title="Recomendado para contactarlo sobre su reporte" />
        <input type="password" id="regPassword" required style="padding: 8px;" placeholder="Contraseña" />
        <button type="submit" class="btn-oficial">Registrarse</button>
      </form>
      <p style="text-align: center; margin-top: 15px; font-size: 14px;">
        ¿Ya tienes cuenta? <a href="#" id="linkLogin" style="color: var(--color-dorado);">Inicia Sesión</a>
      </p>
    </div>
  `;
  document.getElementById('registroForm')!.addEventListener('submit', manejarRegistro);
  document.getElementById('linkLogin')!.addEventListener('click', (e) => { e.preventDefault(); renderLogin(); });
}


// --- LÓGICA: AUTH ---
async function manejarLogin(e: Event) {
  e.preventDefault();
  const email = (document.getElementById('email') as HTMLInputElement).value;
  const password = (document.getElementById('password') as HTMLInputElement).value;

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const datos = await res.json();
    if (!res.ok) throw new Error(datos.mensaje);

    localStorage.setItem('token', datos.token);
    localStorage.setItem('rol', datos.usuario.rol);
    mostrarNotificacion('¡Ingreso exitoso!');
    inicializarApp();
  } catch (err: any) {
    mostrarNotificacion(err.message, 'error');
  }
}

async function manejarRegistro(e: Event) {
  e.preventDefault();
  const nombre = (document.getElementById('regNombre') as HTMLInputElement).value;
  const email = (document.getElementById('regEmail') as HTMLInputElement).value;
  const telefono = (document.getElementById('regTelefono') as HTMLInputElement).value;
  const password = (document.getElementById('regPassword') as HTMLInputElement).value;

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/registro`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, telefono, password })
    });
    const datos = await res.json();
    if (!res.ok) throw new Error(datos.mensaje);

    mostrarNotificacion('¡Registro exitoso! Por favor inicia sesión.');
    renderLogin();
  } catch (err: any) {
    mostrarNotificacion(err.message, 'error');
  }
}


// --- VISTAS: DASHBOARDS ---
function renderDashboardCiudadano() {
  app.innerHTML = `
    <div style="background: white; padding: 30px; border-radius: 8px;">
      <div style="display: flex; justify-content: space-between; border-bottom: 2px solid var(--color-dorado); padding-bottom: 10px; margin-bottom: 20px;">
        <h2 style="color: var(--color-guinda); margin: 0;">Levantar Nuevo Reporte</h2>
        <button onclick="cerrarSesion()" style="background: #ccc; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Cerrar Sesión</button>
      </div>
      <form id="reporteForm" style="display: flex; flex-direction: column; gap: 15px;">
        <input type="text" id="tituloReporte" required style="padding: 8px;" placeholder="Título del problema" />
        <textarea id="descripcionReporte" required rows="4" style="padding: 8px;" placeholder="Describe la situación..."></textarea>
        <button type="submit" class="btn-oficial">Enviar Reporte</button>
      </form>
    </div>
  `;
  document.getElementById('reporteForm')!.addEventListener('submit', manejarEnvioReporte);
}

async function renderDashboardAdmin() {
  app.innerHTML = `
    <div style="background: white; padding: 30px; border-radius: 8px;">
      <div style="display: flex; justify-content: space-between; border-bottom: 2px solid var(--color-dorado); padding-bottom: 10px; margin-bottom: 20px;">
        <h2 style="color: var(--color-guinda); margin: 0;">Panel de Administración</h2>
        <button onclick="cerrarSesion()" style="background: #ccc; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Cerrar Sesión</button>
      </div>
      <div id="listaReportes"><p>Cargando reportes...</p></div>
    </div>
  `;
  cargarReportesAdmin();
}


// --- LÓGICA: REPORTES ---
async function manejarEnvioReporte(e: Event) {
  e.preventDefault();
  const titulo = (document.getElementById('tituloReporte') as HTMLInputElement).value;
  const descripcion = (document.getElementById('descripcionReporte') as HTMLTextAreaElement).value;
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/reportes/crear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ titulo, descripcion })
    });
    if (!res.ok) throw new Error('Error al crear reporte');
    
    mostrarNotificacion('¡Reporte enviado exitosamente al municipio!');
    (document.getElementById('reporteForm') as HTMLFormElement).reset();
  } catch (err) {
    mostrarNotificacion('Error al conectar con el servidor', 'error');
  }
}

async function cargarReportesAdmin() {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/reportes/todos`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const datos = await res.json();
    dibujarReportes(datos.reportes);
  } catch (error) {
    document.getElementById('listaReportes')!.innerHTML = `<p style="color: red;">Error de conexión.</p>`;
  }
}

function dibujarReportes(reportes: any[]) {
  const contenedor = document.getElementById('listaReportes')!;
  if (reportes.length === 0) { contenedor.innerHTML = '<p>No hay reportes.</p>'; return; }

  contenedor.innerHTML = reportes.map(r => `
    <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 6px; border-left: 5px solid var(--color-guinda); background: #fafafa;">
      <div style="display: flex; justify-content: space-between;">
        <h3 style="margin: 0 0 10px 0;">${r.titulo}</h3>
        <span style="font-size: 12px; color: #666;">ID: #${r.id}</span>
      </div>
      <p style="margin: 0 0 10px 0; font-size: 14px;">${r.descripcion}</p>
      
      <div style="background: white; border: 1px solid #eee; padding: 10px; border-radius: 4px; margin-bottom: 15px; font-size: 13px;">
        <strong>Ciudadano:</strong> ${r.ciudadano.nombre || 'No registrado'} <br/>
        <strong>Email:</strong> ${r.ciudadano.email} <br/>
        <strong>Contacto:</strong> ${r.ciudadano.telefono || 'No proporcionado'}
      </div>
      
      <div style="display: flex; flex-wrap: wrap; gap: 15px; align-items: end; background: #fff; padding: 10px; border-radius: 4px; border: 1px solid #eee;">
        <div>
          <label style="display:block; font-size: 12px; font-weight: bold;">Estado</label>
          <select id="est-${r.id}" style="padding: 5px;">
            <option value="pendiente" ${r.estado === 'pendiente' ? 'selected' : ''}>Pendiente</option>
            <option value="en_proceso" ${r.estado === 'en_proceso' ? 'selected' : ''}>En Proceso</option>
            <option value="resuelto" ${r.estado === 'resuelto' ? 'selected' : ''}>Resuelto</option>
          </select>
        </div>
        <div>
          <label style="display:block; font-size: 12px; font-weight: bold;">Prioridad</label>
          <select id="prio-${r.id}" style="padding: 5px;">
            <option value="baja" ${r.prioridad === 'baja' ? 'selected' : ''}>Baja</option>
            <option value="media" ${r.prioridad === 'media' ? 'selected' : ''}>Media</option>
            <option value="alta" ${r.prioridad === 'alta' ? 'selected' : ''}>Alta</option>
          </select>
        </div>
        <div style="flex-grow: 1;">
          <label style="display:block; font-size: 12px; font-weight: bold;">Dependencia Asignada</label>
          <input type="text" id="dep-${r.id}" value="${r.dependencia}" style="padding: 5px; width: 100%; box-sizing: border-box;" />
        </div>
        
        <button onclick="guardarCambiosReporte(${r.id})" class="btn-oficial" style="padding: 6px 12px;">Guardar</button>
        <button onclick="solicitarEliminar(${r.id})" style="padding: 6px 12px; background: var(--color-error); color: white; border: none; border-radius: 4px; cursor: pointer;">Eliminar</button>
      </div>
    </div>
  `).join('');
}

// --- ACCIONES DEL ADMINISTRADOR ---
(window as any).guardarCambiosReporte = async (id: number) => {
  const estado = (document.getElementById(`est-${id}`) as HTMLSelectElement).value;
  const prioridad = (document.getElementById(`prio-${id}`) as HTMLSelectElement).value;
  const dependencia = (document.getElementById(`dep-${id}`) as HTMLInputElement).value;
  
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/reportes/actualizar/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ estado, prioridad, dependencia })
    });
    if (!res.ok) throw new Error('Error al actualizar');
    mostrarNotificacion('¡Cambios guardados correctamente!');
  } catch (error) {
    mostrarNotificacion('Error al actualizar el reporte', 'error');
  }
};

(window as any).solicitarEliminar = (id: number) => {
  mostrarModalConfirmacion('¿Estás seguro que deseas eliminar este ticket permanentemente?', async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/reportes/eliminar/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error();
      mostrarNotificacion('Ticket eliminado correctamente');
      cargarReportesAdmin(); // Recargar la lista para que desaparezca
    } catch (error) {
      mostrarNotificacion('Error al eliminar el ticket', 'error');
    }
  });
};

(window as any).cerrarSesion = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('rol');
  renderLogin();
};

function inicializarApp() {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');
  if (token && rol === 'ciudadano') renderDashboardCiudadano();
  else if (token && rol === 'admin') renderDashboardAdmin();
  else renderLogin();
}

inicializarApp();