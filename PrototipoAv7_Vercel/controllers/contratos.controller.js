// Controlador de contratos

const supabase = require('../config/supabase');

// Vista lista de contratos
module.exports.ObtenerContratos = async (req, res) => {
    res.render('./contratos/lista_contratos', {
        mensaje: req.query.mensaje || null
    });
};

// API: devuelve contratos como JSON para el frontend
module.exports.ApiListaContratos = async (req, res) => {
    try {
        const { data: rows, error } = await supabase
            .from('contrato')
            .select('*')
            .order('id_contrato', { ascending: false });

        if (error) throw new Error(error.message);

        const contratos = (rows || []).map(function(c) {
            return {
                idContrato:  c.id_contrato,
                cliente:     c.id_cliente || '',
                producto:    c.tipo_producto || '',
                inicio:      c.fecha_inicio || '',
                vencimiento: c.fecha_vencimiento || '',
                saldo:       c.saldo || 0,
                estatus:     c.estatus || ''
            };
        });

        res.json({ contratos: contratos });
    } catch (error) {
        res.json({ contratos: [], nota: 'Error al obtener contratos: ' + error.message });
    }
};
