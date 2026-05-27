// Controlador de operaciones

const modelOperaciones = require('../models/operaciones.model');
const modelClientes    = require('../models/clientes.model');
const modelHistorial   = require('../models/historial.model');

// Vista lista de operaciones
module.exports.ObtenerOperaciones = async (req, res) => {
    res.render('./operaciones/lista_operaciones', {
        mensaje: req.query.mensaje || null
    });
};

// API: devuelve operaciones como JSON para el frontend
module.exports.ApiListaOperaciones = async (req, res) => {
    try {
        const resultado = await modelOperaciones.ObtenerOperaciones();
        const operaciones = (resultado.operaciones || []).map(function(o) {
            return {
                idOperacion:   o.id_operacion,
                cliente:       o.id_cliente || '',
                contrato:      o.id_contrato || '',
                producto:      o.contrato ? o.contrato.tipo_producto || '' : '',
                tipoOperacion: o.tipo_operacion || '',
                monto:         o.monto || 0,
                moneda:        o.moneda || 'MXN',
                fecha:         o.fecha_operacion || '',
                estatus:       'Activa'
            };
        });
        res.json({ operaciones: operaciones });
    } catch (error) {
        res.status(503).json({ msg: 'Error al obtener operaciones', detalle: error.message });
    }
};

// Vista formulario agregar operacion (renderiza con lista de clientes)
module.exports.VistaAgregarOperacion = async (req, res) => {
    try {
        const resultado = await modelClientes.ObtenerClientesLista();
        res.render('./operaciones/agregar_operacion', {
            clientes: resultado.clientes || [],
            mensaje:  req.query.mensaje || null
        });
    } catch (error) {
        res.render('./operaciones/agregar_operacion', {
            clientes: [],
            mensaje:  'No se pudo cargar la lista de clientes: ' + error.message
        });
    }
};

// Procesar nueva operacion desde el formulario HTML (redirige al terminar)
module.exports.GuardarOperacion = async (req, res) => {
    const datosOperacion = {
        idcliente:     req.body.idcliente,
        tipooperacion: req.body.tipooperacion,
        monto:         req.body.monto,
        moneda:        req.body.moneda || 'MXN',
        fecha:         req.body.fecha
    };

    if (!datosOperacion.idcliente || !datosOperacion.tipooperacion || !datosOperacion.monto || !datosOperacion.fecha) {
        const resultado = await modelClientes.ObtenerClientesLista().catch(function() { return { clientes: [] }; });
        return res.render('./operaciones/agregar_operacion', {
            clientes: resultado.clientes || [],
            mensaje:  'Faltan campos obligatorios: cliente, tipo, monto y fecha.'
        });
    }

    const resultado = await modelOperaciones.AgregarOperacion(datosOperacion);

    if (resultado.exito) {
        modelHistorial.RegistrarAccion({
            accion:           'INSERT',
            entidad_afectada: 'operacion',
            valor_anterior:   'Cliente: ' + datosOperacion.idcliente,
            valor_nuevo:      datosOperacion.tipooperacion + ' $' + datosOperacion.monto + ' ' + (datosOperacion.moneda || 'MXN')
        }).catch(function() {});
        res.redirect('/operaciones/lista?mensaje=Operacion registrada correctamente.');
    } else {
        const resClientes = await modelClientes.ObtenerClientesLista().catch(function() { return { clientes: [] }; });
        res.render('./operaciones/agregar_operacion', {
            clientes: resClientes.clientes || [],
            mensaje:  'Error al guardar: ' + resultado.error
        });
    }
};

// API JSON (para uso programatico, devuelve JSON)
module.exports.AgregarOperacion = async (req, res) => {
    try {
        const resultado = await modelOperaciones.AgregarOperacion(req.body);
        if (resultado.exito) {
            modelHistorial.RegistrarAccion({
                accion:           'INSERT',
                entidad_afectada: 'operacion',
                valor_anterior:   'Cliente: ' + (req.body.idcliente || ''),
                valor_nuevo:      (req.body.tipooperacion || '') + ' $' + (req.body.monto || 0)
            }).catch(function() {});
            res.json({ exito: true, msg: 'Operacion registrada' });
        } else {
            res.status(400).json({ exito: false, msg: resultado.error });
        }
    } catch (error) {
        res.status(500).json({ exito: false, msg: error.message });
    }
};
