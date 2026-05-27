// Modelos para controlar operaciones

const supabase = require('../config/supabase');

// Obtener todas las operaciones
exports.ObtenerOperaciones = async function() {
    try {
        const { data: operaciones, error } = await supabase
            .from('operacion')
            .select('*, contrato(tipo_producto)')
            .order('id_operacion', { ascending: false });

        if (error) throw new Error(error.message);
        return { exito: true, operaciones: operaciones || [] };
    } catch (error) {
        return { exito: false, operaciones: [], error: error.message };
    }
};

// Agregar nueva operacion
exports.AgregarOperacion = async function(nuevaOperacion) {
    try {
        const { data, error } = await supabase
            .from('operacion')
            .insert([{
                id_cliente:     nuevaOperacion.idcliente,
                id_contrato:    nuevaOperacion.idcontrato || null,
                tipo_operacion: nuevaOperacion.tipooperacion,
                monto:          parseFloat(nuevaOperacion.monto) || 0,
                moneda:         nuevaOperacion.moneda || 'MXN',
                fecha_operacion: nuevaOperacion.fecha || new Date().toISOString().split('T')[0]
            }])
            .select();

        if (error) throw new Error(error.message);
        return { exito: true, operacion: data[0] };
    } catch (error) {
        return { exito: false, error: error.message };
    }
};
