// Controlador de umbrales y criterios PLD

const modelReglas = require('../models/reglas.model');

// Obtener todas las reglas
module.exports.ObtenerReglas = async (req, res) => {
    res.render('./reglas/lista_reglas', {
        mensaje: req.query.mensaje || null
    });
};

// API: devuelve reglas como JSON para el frontend
module.exports.ApiListaReglas = async (req, res) => {
    try {
        const resultado = await modelReglas.ObtenerReglas();
        const reglas = (resultado.reglas || []).map(function(r) {
            return {
                idRegla:    r.id_regla,
                nombre:     r.nombre_regla || '',
                monto:      r.umbral_monto  != null ? r.umbral_monto  : null,
                frecuencia: r.umbral_frecuencia != null ? r.umbral_frecuencia : null,
                activa:     r.activa !== false
            };
        });
        res.json({ reglas: reglas });
    } catch (error) {
        res.status(503).json({ msg: 'Error al obtener reglas', detalle: error.message });
    }
};

// API: editar regla existente
module.exports.ApiEditarRegla = async (req, res) => {
    try {
        const { idRegla, nombre, monto, frecuencia, activa } = req.body;

        if (!idRegla || !nombre) {
            return res.status(400).json({ exito: false, error: 'Faltan datos requeridos' });
        }

        const datos = {
            nombre_regla:      nombre,
            umbral_monto:      monto      != null ? parseFloat(monto)    : null,
            umbral_frecuencia: frecuencia != null ? parseInt(frecuencia) : null,
            activa:            activa !== false && activa !== 'false'
        };

        const resultado = await modelReglas.ActualizarRegla(idRegla, datos);

        if (resultado.exito) {
            res.json({ exito: true });
        } else {
            res.status(400).json({ exito: false, error: resultado.error });
        }
    } catch (error) {
        res.status(500).json({ exito: false, error: error.message });
    }
};

// Vista para agregar regla
module.exports.VistaAgregarRegla = async (req, res) => {
    res.render('./reglas/lista_reglas');
};

// Agregar nueva regla
module.exports.AgregarRegla = async (req, res) => {
    res.redirect('/reglas/lista');
};

// Vista para editar regla
module.exports.VistaEditarRegla = async (req, res) => {
    res.render('./reglas/lista_reglas');
};

// Editar regla existente
module.exports.EditarRegla = async (req, res) => {
    res.redirect('/reglas/lista');
};

// Eliminar regla
module.exports.EliminarRegla = async (req, res) => {
    res.redirect('/reglas/lista');
};
