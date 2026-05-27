const log = console.log;

function money(value) {
    return Number(value || 0).toLocaleString('es-MX');
}

function badgeClass(value) {
    const v = (value || '').toLowerCase();

    if (v === 'alto' || v === 'alerta' || v === 'rechazado' || v === 'muy_alto' || v === 'abierta') {
        return 'badge-danger';
    }

    if (v === 'medio' || v === 'en revision' || v === 'revision' || v === 'validacion' || v === 'pendiente') {
        return 'badge-warn';
    }

    return 'badge-ok';
}

function showMessage(message) {
    const wrapper = document.getElementById('formMessage');

    if (wrapper) {
        wrapper.innerHTML = `<div class="feedback">${message}</div>`;
    }
}

async function getJson(url) {
    const response = await fetch(url);

    if (response.ok) {
        return response.json();
    }

    const errorData = await response.json().catch(function() {
        return {};
    });
    alert(errorData.msg || 'HTTP-Error: ' + response.status);
    return {};
}

async function postJson(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        return response.json();
    }

    const errorData = await response.json().catch(function() {
        return {};
    });
    throw new Error(errorData.msg || 'HTTP-Error: ' + response.status);
}

async function cargarClientes() {
    const data = await getJson('/clientes/api/lista');
    const body = document.getElementById('clientesBody');

    if (!body) return;

    body.innerHTML = (data.clientes || []).map(function(cliente) {
        const id = cliente.idCliente || '';
        return `
            <tr>
                <td>${id}</td>
                <td><strong>${cliente.nombre || ''}</strong></td>
                <td style="font-family:monospace;font-size:13px">${cliente.rfc || ''}</td>
                <td>${cliente.tipoPersona || ''}</td>
                <td><span class="badge-soft ${badgeClass(cliente.riesgo)}">${cliente.riesgo || ''}</span></td>
                <td>${cliente.esPep ? '<span class="badge-soft badge-warn">Si</span>' : 'No'}</td>
                <td style="white-space:nowrap">
                    <a href="/clientes/editar?id=${id}" class="btn-small">Ver expediente</a>
                </td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="7">No hay clientes registrados</td></tr>';
}

async function cargarOperaciones() {
    const data = await getJson('/operaciones/api/lista');
    const body = document.getElementById('operacionesBody');

    if (!body) return;

    body.innerHTML = (data.operaciones || []).map(function(operacion) {
        return `
            <tr>
                <td>${operacion.idOperacion || ''}</td>
                <td>${operacion.cliente || ''}</td>
                <td>${operacion.contrato || ''}</td>
                <td>${operacion.producto || ''}</td>
                <td>${operacion.tipoOperacion || ''}</td>
                <td>$${money(operacion.monto)}</td>
                <td>${operacion.moneda || ''}</td>
                <td>${operacion.fecha || ''}</td>
                <td><span class="badge-soft ${badgeClass(operacion.estatus)}">${operacion.estatus || ''}</span></td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="9">No hay operaciones registradas</td></tr>';
}

function renderAlertas(lista) {
    const body = document.getElementById('alertasBody');
    if (!body) return;

    body.innerHTML = lista.map(function(alerta) {
        var acciones = '';
        if (alerta.estatus === 'Pendiente') {
            acciones += `<button class="btn-small" type="button" style="margin-right:4px" onclick="moverEnRevision('${alerta.idAlerta}')">En revision</button>`;
        }
        if (alerta.estatus !== 'Resuelta') {
            acciones += `<a href="/alertas/detalle?id=${alerta.idAlerta}" class="btn-small">Ver detalle</a>`;
        }
        const fecha = alerta.fecha
            ? new Date(alerta.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
            : '';
        return `
            <tr>
                <td>${alerta.idAlerta || ''}</td>
                <td>${alerta.cliente || ''}</td>
                <td>${alerta.operacion || ''}</td>
                <td>${alerta.regla || ''}</td>
                <td><span class="badge-soft ${badgeClass(alerta.nivel)}">${alerta.nivel || ''}</span></td>
                <td>${fecha}</td>
                <td>${alerta.responsable || ''}</td>
                <td><span class="badge-soft ${badgeClass(alerta.estatus)}">${alerta.estatus || ''}</span></td>
                <td style="white-space:nowrap">${acciones}</td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="9" style="color:var(--muted)">Sin alertas en este estado</td></tr>';
}

function normalizarEstatusAlerta(est) {
    const v = (est || '').toUpperCase().replace(/_/g, ' ').trim();
    if (v === 'ABIERTA'    || v === 'PENDIENTE')  return 'Pendiente';
    if (v === 'EN REVISION'|| v === 'REVISION')   return 'En revision';
    if (v === 'CERRADA'    || v === 'RESUELTA')   return 'Resuelta';
    return est || 'Pendiente';
}

function actualizarContadoresTabs(alertas) {
    var conteos = { 'Pendiente': 0, 'En revision': 0, 'Resuelta': 0 };
    (alertas || []).forEach(function(a) {
        if (conteos[a.estatus] !== undefined) conteos[a.estatus]++;
    });
    var labels = { 'Pendiente': 'Pendientes', 'En revision': 'En revision', 'Resuelta': 'Resueltas' };
    Object.keys(conteos).forEach(function(est) {
        var el = document.getElementById('tab-' + est);
        if (el) el.textContent = labels[est] + (conteos[est] > 0 ? ' (' + conteos[est] + ')' : '');
    });
    var elTodos = document.getElementById('tab-todos');
    if (elTodos) elTodos.textContent = 'Historial (' + (alertas || []).length + ')';
}

async function cargarAlertasConTabs(tabActivo) {
    const data = await getJson('/alertas/api/lista');

    // Normaliza estatus en el cliente por si el servidor devuelve valores crudos del DB
    const alertas = (data.alertas || []).map(function(a) {
        return Object.assign({}, a, { estatus: normalizarEstatusAlerta(a.estatus) });
    });

    if (typeof todasLasAlertas !== 'undefined') {
        todasLasAlertas = alertas;
    }

    actualizarContadoresTabs(alertas);

    var estFiltro = tabActivo || 'Pendiente';
    var lista = estFiltro === 'todos'
        ? alertas
        : alertas.filter(function(a) { return a.estatus === estFiltro; });

    document.querySelectorAll('.tab-lite').forEach(function(btn) { btn.classList.remove('active'); });
    var tabEl = document.getElementById('tab-' + estFiltro);
    if (tabEl) tabEl.classList.add('active');

    renderAlertas(lista);
}

async function cargarAlertas() {
    await cargarAlertasConTabs();
}

async function moverEnRevision(idAlerta) {
    try {
        await postJson('/alertas/api/estatus', { idAlerta: idAlerta, estatus: 'En revision' });
        await cargarAlertasConTabs('En revision');
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function cargarContratos() {
    const data = await getJson('/contratos/api/lista');
    const body = document.getElementById('contratosBody');

    if (!body) return;

    body.innerHTML = (data.contratos || []).map(function(contrato) {
        return `
            <tr>
                <td>${contrato.idContrato || ''}</td>
                <td>${contrato.cliente || ''}</td>
                <td>${contrato.producto || ''}</td>
                <td>${contrato.inicio || ''}</td>
                <td>${contrato.vencimiento || ''}</td>
                <td>$${money(contrato.saldo)}</td>
                <td><span class="badge-soft ${badgeClass(contrato.estatus)}">${contrato.estatus || ''}</span></td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="7">No hay contratos registrados</td></tr>';
}

async function cargarUsuarios() {
    const data = await getJson('/admin/api/lista');
    const body = document.getElementById('usuariosBody');

    if (!body) return;

    body.innerHTML = (data.usuarios || []).map(function(usuario) {
        const nombre   = (usuario.nombre   || '').replace(/'/g, "\\'");
        const apellido = (usuario.apellido || '').replace(/'/g, "\\'");
        const correo   = (usuario.correo   || '').replace(/'/g, "\\'");
        return `
            <tr>
                <td>${usuario.idUsuario || ''}</td>
                <td>${usuario.nombre || ''}</td>
                <td>${usuario.correo || ''}</td>
                <td>${usuario.rol || ''}</td>
                <td style="white-space:nowrap">
                    <button class="btn-small" type="button" onclick="abrirModalUsuario('${usuario.idUsuario}','${nombre}','${apellido}','${correo}',${usuario.idRol || 'null'},${usuario.activo})">Editar</button>
                </td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="5">No hay usuarios registrados</td></tr>';
}

async function cargarDashboard() {
    try {
        const data = await getJson('/api/dashboard');

        const totalClientes = document.getElementById('totalClientes');
        const totalOperaciones = document.getElementById('totalOperaciones');
        const totalAlertasPendientes = document.getElementById('totalAlertasPendientes');
        const totalReportesListos = document.getElementById('totalReportesListos');

        if (totalClientes) totalClientes.textContent = data.totalClientes || 0;
        if (totalOperaciones) totalOperaciones.textContent = data.totalOperaciones || 0;
        if (totalAlertasPendientes) totalAlertasPendientes.textContent = data.totalAlertasPendientes || 0;
        if (totalReportesListos) totalReportesListos.textContent = data.totalReportesListos || 0;

        const alertasEl = document.getElementById('alertasRecientesContent');
        if (alertasEl) {
            const alertas = data.alertasRecientes || [];
            if (alertas.length === 0) {
                alertasEl.innerHTML = '<p style="color:var(--muted);font-size:13px;margin:0;">Sin alertas recientes</p>';
            } else {
                alertasEl.innerHTML = alertas.map(function(a) {
                    const fecha = a.fecha ? new Date(a.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
                    return '<div class="alerta-row">' +
                        '<div class="alerta-row-info"><span class="badge-soft badge-danger">ABIERTA</span>&nbsp;&nbsp;' + (a.tipo || 'Alerta') + '</div>' +
                        '<span class="alerta-row-fecha">' + fecha + '</span>' +
                        '</div>';
                }).join('');
            }
        }

        const riesgoBody = document.getElementById('riesgoBody');
        if (riesgoBody) {
            const dist = data.distribucionRiesgo || { bajo: 0, medio: 0, alto: 0 };
            riesgoBody.innerHTML =
                '<tr><td><span class="badge-soft badge-ok">Bajo</span></td><td class="riesgo-count">' + dist.bajo + '</td></tr>' +
                '<tr><td><span class="badge-soft badge-warn">Medio</span></td><td class="riesgo-count">' + dist.medio + '</td></tr>' +
                '<tr><td><span class="badge-soft badge-danger">Alto</span></td><td class="riesgo-count">' + dist.alto + '</td></tr>';
        }
    } catch (error) {
        log('Error al cargar dashboard:', error.message);
    }
}

async function cargarReportes() {
    const data = await getJson('/reportes/api/lista');
    const reportes = data.reportes || [];
    const body = document.getElementById('reportesBody');

    if (!body) return;

    body.innerHTML = reportes.map(function(reporte) {
        return `
            <tr>
                <td>${reporte.clave || ''}</td>
                <td>${reporte.nombre || ''}</td>
                <td>${reporte.periodo || ''}</td>
                <td>${reporte.formato || ''}</td>
                <td><span class="badge-soft ${badgeClass(reporte.estatus)}">${reporte.estatus || ''}</span></td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="5">No hay reportes registrados</td></tr>';
}

async function cargarHistorial(url) {
    const endpoint = url || '/historial/api/lista';
    const data = await getJson(endpoint);
    const body = document.getElementById('historialBody');

    if (!body) return;

    body.innerHTML = (data.eventos || []).map(function(evento) {
        const fecha = evento.fechaHora
            ? new Date(evento.fechaHora).toLocaleString('es-MX')
            : '';
        return `
            <tr>
                <td>${evento.idEvento || ''}</td>
                <td><span class="badge-soft">${evento.tipoAccion || ''}</span></td>
                <td>${evento.descripcion || ''}</td>
                <td style="white-space:nowrap;font-size:13px">${fecha}</td>
                <td>${evento.idUsuario || '-'}</td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="5">No hay eventos registrados</td></tr>';
}

async function cargarReglas() {
    const data = await getJson('/reglas/api/lista');
    const body = document.getElementById('reglasBody');

    if (!body) return;

    body.innerHTML = (data.reglas || []).map(function(regla) {
        const monto      = regla.monto      != null ? '$' + money(regla.monto)   : '<span style="color:var(--muted)">—</span>';
        const frecuencia = regla.frecuencia != null ? regla.frecuencia + ' ops.' : '<span style="color:var(--muted)">—</span>';
        const badge      = regla.activa
            ? '<span class="badge-soft badge-ok">Activa</span>'
            : '<span class="badge-soft">Inactiva</span>';
        const montoVal   = regla.monto      != null ? regla.monto      : 'null';
        const frecVal    = regla.frecuencia != null ? regla.frecuencia : 'null';
        return `
            <tr>
                <td>${regla.idRegla}</td>
                <td>${regla.nombre}</td>
                <td>${monto}</td>
                <td>${frecuencia}</td>
                <td>${badge}</td>
                <td><button class="btn-small" type="button" onclick="abrirModalRegla('${regla.idRegla}','${regla.nombre.replace(/'/g,"\\'")}',${montoVal},${frecVal},${regla.activa})">Editar</button></td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="6">No hay reglas registradas</td></tr>';
}

