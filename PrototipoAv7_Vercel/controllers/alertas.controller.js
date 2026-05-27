// Controller de alertas PLD

const modelAlertas = require('../models/alertas.model');
const supabase     = require('../config/supabase');

function normalizarEstatus(dbEstatus) {
    const v = (dbEstatus || '').toUpperCase().trim();
    if (v === 'ABIERTA'     || v === 'PENDIENTE')   return 'Pendiente';
    if (v === 'EN_REVISION' || v === 'EN REVISION'
                             || v === 'REVISION')    return 'En revision';
    if (v === 'CERRADA'     || v === 'RESUELTA'
                             || v === 'CLOSED')      return 'Resuelta';
    return 'Pendiente';
}

// Vista lista de alertas
module.exports.ObtenerAlertas = async (req, res) => {
    res.render('./alertas/lista_alertas', {
        mensaje: req.query.mensaje || null
    });
};

// API: devuelve alertas como JSON para el frontend
module.exports.ApiListaAlertas = async (req, res) => {
    try {
        const resultado = await modelAlertas.ObtenerAlertas();
        const alertas = (resultado.alertas || []).map(function(a) {
            const tipo = a.tipo_alerta || '';
            let nivel = 'Bajo';
            if (tipo.toLowerCase().includes('relevante')) nivel = 'Alto';
            else if (tipo.toLowerCase().includes('inusual')) nivel = 'Medio';
            const oficial = a.oficial;
            const responsable = oficial
                ? (oficial.nombre + ' ' + oficial.apellido).trim()
                : '';
            return {
                idAlerta:    a.id_alerta,
                cliente:     a.id_cliente   || '',
                operacion:   a.id_operacion || '',
                regla:       a.id_regla ? 'Regla #' + a.id_regla : (tipo || ''),
                nivel:       nivel,
                fecha:       a.fecha_generacion || '',
                responsable: responsable,
                estatus:     normalizarEstatus(a.estatus)
            };
        });
        res.json({ alertas: alertas });
    } catch (error) {
        res.status(503).json({ msg: 'Error al obtener alertas', detalle: error.message });
    }
};

// API: cambiar estatus (Pendiente → En revision)
module.exports.ApiCambiarEstatus = async (req, res) => {
    try {
        const { idAlerta, estatus } = req.body;
        const resultado = await modelAlertas.CambiarEstatus(idAlerta, estatus);
        res.json({ exito: resultado.exito });
    } catch (error) {
        res.status(503).json({ msg: 'Error al cambiar estatus', detalle: error.message });
    }
};

// API: resolver una alerta
module.exports.ApiResolverAlerta = async (req, res) => {
    try {
        const { idAlerta, resolucion } = req.body;
        if (!idAlerta) {
            return res.status(400).json({ msg: 'Falta idAlerta' });
        }
        const resultado = await modelAlertas.ResolverAlerta(idAlerta, { resolucion: resolucion || '' });
        res.json({ exito: resultado.exito, msg: 'Alerta resuelta' });
    } catch (error) {
        res.status(503).json({ msg: 'Error al resolver alerta', detalle: error.message });
    }
};

// Vista detalle de alerta con historial del cliente
module.exports.VistaDetalleAlerta = async (req, res) => {
    try {
        const idAlerta = req.query.id;
        if (!idAlerta) return res.redirect('/alertas/lista');

        const resAlerta = await modelAlertas.ObtenerAlertaPorId(idAlerta);
        if (!resAlerta.exito) return res.redirect('/alertas/lista');

        const a = resAlerta.alerta;

        const tipo = a.tipo_alerta || '';
        let nivel = 'Bajo';
        if (tipo.toLowerCase().includes('relevante')) nivel = 'Alto';
        else if (tipo.toLowerCase().includes('inusual')) nivel = 'Medio';

        const oficial = a.oficial;
        const alerta = {
            id_alerta:    a.id_alerta,
            regla:        a.id_regla ? 'Regla #' + a.id_regla : (tipo || '—'),
            nivel:        nivel,
            fecha:        a.fecha_generacion || '—',
            responsable:  oficial ? (oficial.nombre + ' ' + oficial.apellido).trim() : '—',
            estatus:      normalizarEstatus(a.estatus),
            id_cliente:   a.id_cliente,
            resolucion:   a.resolucion || ''
        };

        const [resCliente, resOps] = await Promise.all([
            supabase.from('cliente').select('*').eq('id_cliente', a.id_cliente).single(),
            supabase.from('operacion').select('*').eq('id_cliente', a.id_cliente).order('id_operacion', { ascending: false })
        ]);

        res.render('./alertas/detalle_alerta', {
            alerta:      alerta,
            cliente:     resCliente.data || null,
            operaciones: resOps.data    || []
        });
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
};

// Procesar resolucion desde el detalle
module.exports.ProcesarResolucion = async (req, res) => {
    try {
        await modelAlertas.ResolverAlerta(req.body.idAlerta, { resolucion: req.body.resolucion || '' });
    } catch (e) {}
    res.redirect('/alertas/lista');
};

// Vista formulario resolver alerta (legado)
module.exports.VistaResolverAlerta = async (req, res) => {
    res.render('./alertas/lista_alertas', { mensaje: null });
};

// Guardar resolucion (legado)
module.exports.ResolverAlerta = async (req, res) => {
    res.redirect('/alertas/lista');
};
