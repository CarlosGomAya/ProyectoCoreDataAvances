// Modelo para clientes

const supabase = require('../config/supabase');
const crypto   = require('crypto');


// Obtener lista de todos los clientes
module.exports.ObtenerClientesLista = async () => {
    try {
        const { data: clientes, error } = await supabase
            .from('cliente')
            .select('*')
            .order('id_cliente', { ascending: false });

        if (error) throw new Error(`Error al obtener clientes: ${error.message}`);
        return { exito: true, clientes: clientes || [] };

    } catch (error) {
        return { exito: false, clientes: [], error: error.message };
    }
};


// Guardar cliente nuevo con sus documentos
module.exports.GuardarCliente = async (datosCliente, archivos) => {
    try {
        const { data: cliente, error: errorCliente } = await supabase
            .from('cliente')
            .insert([{
                nombre_razon_social: datosCliente.nombre,
                tipo_persona:        datosCliente.tipoCliente,
                rfc:                 datosCliente.rfc,
                curp:                datosCliente.curp || null,
                telefono:            datosCliente.telefono || null,
                correo:              datosCliente.correo || null,
                nivel_riesgo:        datosCliente.nivelRiesgo || 'MEDIO',
                observaciones:       datosCliente.observaciones || null,
                estatus:             datosCliente.estatusCliente || 'ACTIVO',
                es_pep:              datosCliente.esPEP === 'Si' ? true : false
            }])
            .select();

        if (errorCliente) throw new Error(`Error al guardar cliente: ${errorCliente.message}`);

        const idCliente = cliente[0].id_cliente;

        // Guardar domicilio si se enviaron datos de dirección
        const tieneDomicilio = datosCliente.calle || datosCliente.colonia ||
                               datosCliente.ciudad || datosCliente.estado;
        if (tieneDomicilio) {
            await supabase.from('domicilio').insert([{
                id_cliente:     idCliente,
                calle:          datosCliente.calle    || null,
                colonia:        datosCliente.colonia  || null,
                ciudad:         datosCliente.ciudad   || null,
                estado:         datosCliente.estado   || null,
                pais:           datosCliente.pais     || null,
                tipo_domicilio: datosCliente.tipoDomicilio || null
            }]);
        }

        // Guardar documentos si se subieron archivos
        if (archivos && Object.keys(archivos).length > 0) {
            for (const [tipoDoc, archivo] of Object.entries(archivos)) {
                if (archivo && archivo.size > 0) {
                    await supabase.from('documento').insert([{
                        id_cliente:     idCliente,
                        id_tipo_doc:    1,
                        tipo_nombre:    tipoDoc,
                        nombre_archivo: archivo.name,
                        ruta_archivo:   `/uploads/${tipoDoc}/${archivo.name}`,
                        estatus:        'PENDIENTE'
                    }]);
                }
            }
        }

        return { exito: true, idCliente: idCliente, mensaje: 'Cliente y documentos guardados correctamente' };

    } catch (error) {
        return { exito: false, error: error.message };
    }
};


// Obtener un cliente por su ID
module.exports.ObtenerClientePorId = async (idCliente) => {
    try {
        const { data, error } = await supabase
            .from('cliente')
            .select('*')
            .eq('id_cliente', idCliente)
            .single();

        if (error) throw new Error(error.message);
        return { exito: true, cliente: data };

    } catch (error) {
        return { exito: false, error: error.message };
    }
};


// Editar cliente existente
module.exports.EditarCliente = async (idCliente, datosActualizados) => {
    try {
        const { error } = await supabase
            .from('cliente')
            .update(datosActualizados)
            .eq('id_cliente', idCliente);

        if (error) throw new Error(error.message);
        return { exito: true };

    } catch (error) {
        return { exito: false, error: error.message };
    }
};


// Eliminar cliente
module.exports.EliminarCliente = async (idCliente) => {
    try {
        const { error } = await supabase
            .from('cliente')
            .delete()
            .eq('id_cliente', idCliente);

        if (error) throw new Error(error.message);
        return { exito: true };

    } catch (error) {
        return { exito: false, error: error.message };
    }
};


// Obtener documentos de un cliente
module.exports.ObtenerDocumentosCliente = async (idCliente) => {
    try {
        const { data: documentos, error } = await supabase
            .from('documento')
            .select('*')
            .eq('id_cliente', idCliente)
            .order('id_documento', { ascending: false });

        if (error) throw new Error(error.message);
        return { exito: true, documentos: documentos || [] };

    } catch (error) {
        return { exito: false, documentos: [], error: error.message };
    }
};


// Obtener domicilio de un cliente
module.exports.ObtenerDomicilioCliente = async (idCliente) => {
    try {
        const { data, error } = await supabase
            .from('domicilio')
            .select('*')
            .eq('id_cliente', idCliente)
            .limit(1)
            .maybeSingle();

        if (error) throw new Error(error.message);
        return { exito: true, domicilio: data || null };
    } catch (error) {
        return { exito: false, domicilio: null, error: error.message };
    }
};


// Crear o actualizar domicilio de un cliente
module.exports.GuardarOActualizarDomicilio = async (idCliente, datos) => {
    try {
        const { data: existing } = await supabase
            .from('domicilio')
            .select('id_domicilio')
            .eq('id_cliente', idCliente)
            .limit(1)
            .maybeSingle();

        if (existing) {
            const { error } = await supabase
                .from('domicilio')
                .update(datos)
                .eq('id_domicilio', existing.id_domicilio);
            if (error) throw new Error(error.message);
        } else {
            const { error } = await supabase
                .from('domicilio')
                .insert([{ id_cliente: parseInt(idCliente), ...datos }]);
            if (error) throw new Error(error.message);
        }
        return { exito: true };
    } catch (error) {
        return { exito: false, error: error.message };
    }
};


// Insertar múltiples clientes desde un CSV
module.exports.ImportarClientesDesdeCSV = async (filas) => {
    try {
        const rows = filas.map(function(f) {
            return {
                nombre_razon_social: f.nombre || f.nombre_razon_social || null,
                tipo_persona:        f.tipo_persona || 'FISICA',
                rfc:                 f.rfc || null,
                curp:                f.curp || null,
                estatus:             f.estatus || 'ACTIVO',
                telefono:            f.telefono || null,
                correo:              f.correo || null,
                nivel_riesgo:        (f.nivel_riesgo || 'MEDIO').toUpperCase(),
                es_pep:              f.es_pep === 'true' || f.es_pep === true,
                observaciones:       f.observaciones || null
            };
        });

        const { error } = await supabase.from('cliente').insert(rows);
        if (error) throw new Error(error.message);
        return { exito: true, insertados: rows.length };
    } catch (error) {
        return { exito: false, error: error.message };
    }
};

// Actualizar estado de validacion de documento
module.exports.ActualizarEstadoDocumento = async (idDocumento, estadoValidacion) => {
    try {
        // Mapear valores del frontend a los permitidos por la BD
        const mapaEstatus = {
            'Validado':  'APROBADO',
            'Rechazado': 'RECHAZADO',
            'APROBADO':  'APROBADO',
            'RECHAZADO': 'RECHAZADO',
            'PENDIENTE': 'PENDIENTE',
            'VENCIDO':   'VENCIDO'
        };
        const estatus = mapaEstatus[estadoValidacion] || 'PENDIENTE';

        const { error } = await supabase
            .from('documento')
            .update({ estatus: estatus })
            .eq('id_documento', idDocumento);

        if (error) throw new Error(error.message);
        return { exito: true };

    } catch (error) {
        return { exito: false, error: error.message };
    }
};
