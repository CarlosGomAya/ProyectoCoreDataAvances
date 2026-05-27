// Modelo para alertas PLD

const supabase = require('../config/supabase');

// Obtener todas las alertas
exports.ObtenerAlertas = async function() {
    try {
        const { data: alertas, error } = await supabase
            .from('alerta')
            .select('*, oficial:usuario!id_oficial(nombre, apellido)')
            .order('id_alerta', { ascending: false });

        if (error) throw new Error(error.message);
        return { exito: true, alertas: alertas || [] };
    } catch (error) {
        return { exito: false, alertas: [], error: error.message };
    }
};

// Resolver una alerta cambiando su estatus a CERRADA
exports.ResolverAlerta = async function(idAlerta, datosResolucion) {
    try {
        const { error } = await supabase
            .from('alerta')
            .update({
                estatus:    'CERRADA',
                resolucion: datosResolucion.resolucion || ''
            })
            .eq('id_alerta', idAlerta);

        if (error) throw new Error(error.message);
        return { exito: true };
    } catch (error) {
        return { exito: false, error: error.message };
    }
};

// Cambiar estatus de una alerta (ABIERTA → EN_REVISION → CERRADA)
exports.CambiarEstatus = async function(idAlerta, nuevoEstatus) {
    try {
        const mapaEstatus = {
            'En revision': 'EN_REVISION',
            'Resuelta':    'CERRADA',
            'Pendiente':   'ABIERTA'
        };
        const dbEstatus = mapaEstatus[nuevoEstatus] || nuevoEstatus;

        const { error } = await supabase
            .from('alerta')
            .update({ estatus: dbEstatus })
            .eq('id_alerta', idAlerta);

        if (error) throw new Error(error.message);
        return { exito: true };
    } catch (error) {
        return { exito: false, error: error.message };
    }
};

// Obtener una alerta por ID
exports.ObtenerAlertaPorId = async function(idAlerta) {
    try {
        const { data, error } = await supabase
            .from('alerta')
            .select('*, oficial:usuario!id_oficial(nombre, apellido)')
            .eq('id_alerta', idAlerta)
            .single();

        if (error) throw new Error(error.message);
        return { exito: true, alerta: data };
    } catch (error) {
        return { exito: false, error: error.message };
    }
};

// Generar una alerta automatica si la operacion supera el umbral (regla 1: >50,000)
exports.GenerarAlertaSiAplica = async function(operacion) {
    const monto = parseFloat(operacion.monto) || 0;

    if (monto >= 50000) {
        try {
            await supabase.from('alerta').insert([{
                id_operacion:    operacion.id_operacion,
                id_cliente:      operacion.id_cliente,
                id_regla:        monto >= 100000 ? 3 : 1,
                tipo_alerta:     monto >= 100000 ? 'Operación relevante' : 'Operación inusual',
                estatus:         'ABIERTA',
                fecha_generacion: new Date().toISOString()
            }]);
        } catch (err) {
            console.error('Error al generar alerta:', err.message);
        }
    }
};
