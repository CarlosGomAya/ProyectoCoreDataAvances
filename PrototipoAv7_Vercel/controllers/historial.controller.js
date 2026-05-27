// Controlador de historial de acciones y eventos del sistema

const modelHistorial = require('../models/historial.model');

// Vista lista de historial (datos se cargan via AJAX)
module.exports.ObtenerHistorial = async (req, res) => {
    res.render('./historial/lista_historial', {
        mensaje: req.query.mensaje || null
    });
};

function mapearEvento(e) {
    return {
        idEvento:          e.id_historial,
        tipoAccion:        e.accion || '',
        descripcion:       e.entidad_afectada || '',
        fechaHora:         e.fecha_hora || '',
        idUsuario:         e.id_usuario || '',
        detallesOperacion: e.valor_anterior || ''
    };
}

// API: lista completa de historial como JSON
module.exports.ApiListaHistorial = async (req, res) => {
    try {
        const resultado = await modelHistorial.ObtenerHistorial();
        res.json({ eventos: (resultado.eventos || []).map(mapearEvento) });
    } catch (error) {
        res.status(503).json({ msg: 'Error al obtener historial', detalle: error.message });
    }
};

// API: historial filtrado por tipo de accion y/o rango de fechas
module.exports.ApiFiltrarHistorial = async (req, res) => {
    try {
        const { tipoaccion, fechainicio, fechafin, idusuario } = req.query;
        let resultado;

        if (fechainicio && fechafin) {
            resultado = await modelHistorial.ObtenerHistorialPorFechas(fechainicio, fechafin);
        } else if (tipoaccion) {
            resultado = await modelHistorial.ObtenerHistorialPorAccion(tipoaccion);
        } else if (idusuario) {
            resultado = await modelHistorial.ObtenerHistorialPorUsuario(idusuario);
        } else {
            resultado = await modelHistorial.ObtenerHistorial();
        }

        res.json({ eventos: (resultado.eventos || []).map(mapearEvento) });
    } catch (error) {
        res.status(503).json({ msg: 'Error al filtrar historial', detalle: error.message });
    }
};

// Historial filtrado por usuario
module.exports.HistorialPorUsuario = async (req, res) => {
    const idUsuario = req.query.id || '';
    const resultado = await modelHistorial.ObtenerHistorialPorUsuario(idUsuario);
    res.json({ eventos: (resultado.eventos || []).map(mapearEvento) });
};

// Historial filtrado por tipo de accion
module.exports.HistorialPorAccion = async (req, res) => {
    const tipoAccion = req.query.tipo || '';
    const resultado = await modelHistorial.ObtenerHistorialPorAccion(tipoAccion);
    res.json({ eventos: (resultado.eventos || []).map(mapearEvento) });
};

// Detalle de un evento especifico
module.exports.DetalleEvento = async (req, res) => {
    const idEvento = req.query.id || '';
    const resultado = await modelHistorial.ObtenerEventoPorId(idEvento);
    res.json({ evento: resultado.evento ? mapearEvento(resultado.evento) : null });
};
