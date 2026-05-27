// Controlar todo el apartado de los clientes

const modelClientes = require('../models/clientes.model');

// NO TOCAR: esto jala los datos de la DB para mostrarlos
module.exports.ObtenerClientes = async (req, res) => {
    try {
        res.render('./clientes/lista_clientes', {
            mensaje: req.query.mensaje || null
        });
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
};

// Mostrar formulario de nuevo expediente
module.exports.VistaExpedienteCliente = async (req, res) => {
    try {
        res.render('./clientes/expediente_cliente');
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
};

// Recibir formulario y guardar cliente + documentos
module.exports.GuardarExpediente = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ exito: false, error: 'No se recibieron datos' });
        }

        const resultado = await modelClientes.GuardarCliente(req.body, req.files || {});

        if (resultado.exito) {
            res.status(200).json({ exito: true, mensaje: resultado.mensaje, idCliente: resultado.idCliente });
        } else {
            res.status(400).json({ exito: false, error: resultado.error });
        }

    } catch (error) {
        res.status(500).json({ exito: false, error: error.message });
    }
};

// Agregar a un cliente enviar al expediente
module.exports.VistaAgregarCliente = async (req, res) => {
    try {
        res.render('./clientes/expediente_cliente');
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
};

module.exports.AgregarCliente = async (req, res) => {
    try {
        res.redirect('/clientes/lista');
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
};

// Solo lectura del expediente de los clientes
module.exports.VistaEditarCliente = async (req, res) => {
    try {
        const idCliente = req.query.id;
        if (!idCliente) return res.redirect('/clientes/lista');

        const resultado = await modelClientes.ObtenerClientePorId(idCliente);
        if (!resultado.exito) return res.redirect('/clientes/lista');

        const resultadoDom = await modelClientes.ObtenerDomicilioCliente(idCliente);

        res.render('./clientes/editar_cliente', {
            cliente:   resultado.cliente,
            domicilio: resultadoDom.domicilio || {},
            mensaje:   req.query.mensaje || null
        });
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
};

// Permite actualizar al cliente
module.exports.EditarCliente = async (req, res) => {
    try {
        const { idCliente } = req.body;

        if (!idCliente) {
            return res.status(400).json({ exito: false, error: 'ID Cliente requerido' });
        }

        const datosActualizar = {
            nombre_razon_social: req.body.nombre,
            rfc:                 req.body.rfc,
            curp:                req.body.curp || null,
            correo:              req.body.correo || null,
            telefono:            req.body.telefono || null,
            tipo_persona:        req.body.tipoPersona,
            nacionalidad:        req.body.nacionalidad || null,
            nivel_riesgo:        req.body.nivelRiesgo || 'MEDIO',
            observaciones:       req.body.observaciones || null,
            es_pep:              req.body.esPep === 'Si' ? true : false
        };

        const resultado = await modelClientes.EditarCliente(idCliente, datosActualizar);

        if (resultado.exito) {
            const datosDomicilio = {
                calle:          req.body.calle || null,
                colonia:        req.body.colonia || null,
                ciudad:         req.body.ciudad || null,
                estado:         req.body.estado || null,
                pais:           req.body.pais || null,
                tipo_domicilio: req.body.tipoDomicilio || null
            };
            const resultadoDom = await modelClientes.GuardarOActualizarDomicilio(idCliente, datosDomicilio);
            if (!resultadoDom.exito) {
                return res.redirect('/clientes/editar?id=' + idCliente + '&mensaje=Cliente actualizado pero error al guardar domicilio: ' + resultadoDom.error);
            }
            res.redirect('/clientes/editar?id=' + idCliente + '&mensaje=Cliente actualizado correctamente');
        } else {
            res.redirect('/clientes/editar?id=' + idCliente + '&mensaje=Error al actualizar: ' + resultado.error);
        }
    } catch (error) {
        res.status(500).json({ exito: false, error: error.message });
    }
};

// Eliminar cliente
module.exports.EliminarCliente = async (req, res) => {
    try {
        res.redirect('/clientes/lista');
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
};

// Ver documentos del cliente
module.exports.VistaDocumentosCliente = async (req, res) => {
    try {
        const idCliente = req.query.id;
        if (!idCliente) return res.redirect('/clientes/lista');

        const resultado = await modelClientes.ObtenerClientePorId(idCliente);
        if (!resultado.exito) return res.redirect('/clientes/lista');

        const resultadoDocs = await modelClientes.ObtenerDocumentosCliente(idCliente);

        res.render('./clientes/documentos_cliente', {
            cliente:    resultado.cliente,
            documentos: resultadoDocs.documentos
        });
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
};

// API: devuelve clientes como JSON para el frontend
module.exports.ApiListaClientes = async (req, res) => {
    try {
        const resultado = await modelClientes.ObtenerClientesLista();
        const clientes = (resultado.clientes || []).map(function(c) {
            return {
                idCliente:   c.id_cliente,
                nombre:      c.nombre_razon_social || '',
                rfc:         c.rfc || '',
                tipoPersona: c.tipo_persona || '',
                riesgo:      c.nivel_riesgo || 'MEDIO',
                esPep:       c.es_pep || false,
                estatus:     c.estatus || 'ACTIVO'
            };
        });
        res.json({ clientes: clientes });
    } catch (error) {
        res.status(503).json({ msg: 'Error al obtener clientes', detalle: error.message });
    }
};

// Importar clientes desde un archivo CSV
module.exports.ImportarCSV = async (req, res) => {
    try {
        if (!req.files || !req.files.csv) {
            return res.status(400).json({ exito: false, error: 'No se recibio el archivo CSV' });
        }

        const contenido = req.files.csv.data.toString('utf-8');
        const lineas    = contenido.split('\n').map(function(l) { return l.trim(); }).filter(function(l) { return l.length > 0; });

        if (lineas.length < 2) {
            return res.status(400).json({ exito: false, error: 'El CSV esta vacio o no tiene datos' });
        }

        const encabezados = lineas[0].split(',').map(function(h) { return h.trim(); });
        const filas       = [];

        for (var i = 1; i < lineas.length; i++) {
            const valores = lineas[i].split(',');
            const fila    = {};
            encabezados.forEach(function(col, idx) {
                fila[col] = (valores[idx] || '').trim();
            });
            filas.push(fila);
        }

        const resultado = await modelClientes.ImportarClientesDesdeCSV(filas);

        if (resultado.exito) {
            res.json({ exito: true, insertados: resultado.insertados });
        } else {
            res.status(400).json({ exito: false, error: resultado.error });
        }
    } catch (error) {
        res.status(500).json({ exito: false, error: error.message });
    }
};

// Cambiar el estado de los documentos
module.exports.ValidarDocumento = async (req, res) => {
    try {
        const { idDocumento, estado } = req.body;

        if (!idDocumento || !estado) {
            return res.status(400).json({ exito: false, error: 'Faltan datos' });
        }

        if (!['Validado', 'Rechazado', 'APROBADO', 'RECHAZADO'].includes(estado)) {
            return res.status(400).json({ exito: false, error: 'Estado inválido' });
        }

        const resultado = await modelClientes.ActualizarEstadoDocumento(idDocumento, estado);

        if (resultado.exito) {
            res.json({ exito: true, mensaje: `Documento actualizado` });
        } else {
            res.status(400).json({ exito: false, error: resultado.error });
        }
    } catch (error) {
        res.status(500).json({ exito: false, error: error.message });
    }
};
