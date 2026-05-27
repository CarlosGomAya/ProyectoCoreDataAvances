// Controlador de reportes

const supabase = require('../config/supabase');

// Vista lista de reportes
module.exports.LoginReportes = async (req, res) => {
    res.render('./reportes/lista_reportes', {
        mensaje: req.query.mensaje || null
    });
};

// API: devuelve reportes como JSON para el frontend
module.exports.ApiListaReportes = async (req, res) => {
    try {
        const { data: rows, error } = await supabase
            .from('reporte')
            .select('*')
            .order('id_reporte', { ascending: false });

        if (error) throw new Error(error.message);

        const reportes = (rows || []).map(function(r) {
            return {
                idReporte: r.id_reporte,
                clave:     r.id_reporte || '',
                nombre:    r.tipo_reporte || '',
                periodo:   r.periodo_reportado || '',
                estatus:   r.estatus_envio || '',
                formato:   r.canal_envio || ''
            };
        });

        res.json({ reportes: reportes });
    } catch (error) {
        res.json({ reportes: [], nota: 'Error al obtener reportes: ' + error.message });
    }
};
