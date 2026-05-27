// reglas y umbrales PLD

const supabase = require('../config/supabase');

// Obtener todas las reglas activas
exports.ObtenerReglas = async function() {
    try {
        const { data: reglas, error } = await supabase
            .from('regla_alerta')
            .select('*')
            .order('id_regla', { ascending: true });

        if (error) throw new Error(error.message);
        return { exito: true, reglas: reglas || [] };
    } catch (error) {
        return { exito: false, reglas: [], error: error.message };
    }
};

// Obtener regla por ID
exports.ObtenerReglaPorId = async function(idRegla) {
    try {
        const { data, error } = await supabase
            .from('regla_alerta')
            .select('*')
            .eq('id_regla', idRegla)
            .single();

        if (error) throw new Error(error.message);
        return { exito: true, regla: data };
    } catch (error) {
        return { exito: false, regla: null, error: error.message };
    }
};

// Crear nueva regla
exports.CrearRegla = async function(datosRegla) {
    try {
        const { data, error } = await supabase
            .from('regla_alerta')
            .insert([{
                nombre_regla:      datosRegla.nombre_regla,
                umbral_monto:      datosRegla.umbral_monto ? parseFloat(datosRegla.umbral_monto) : null,
                umbral_frecuencia: datosRegla.umbral_frecuencia ? parseInt(datosRegla.umbral_frecuencia) : null,
                activa:            datosRegla.activa !== false
            }])
            .select();

        if (error) throw new Error(error.message);
        return { exito: true, regla: data[0] };
    } catch (error) {
        return { exito: false, error: error.message };
    }
};

// Actualizar regla existente
exports.ActualizarRegla = async function(idRegla, datosActualizados) {
    try {
        const { error } = await supabase
            .from('regla_alerta')
            .update(datosActualizados)
            .eq('id_regla', idRegla);

        if (error) throw new Error(error.message);
        return { exito: true };
    } catch (error) {
        return { exito: false, error: error.message };
    }
};

// Eliminar regla
exports.EliminarRegla = async function(idRegla) {
    try {
        const { error } = await supabase
            .from('regla_alerta')
            .delete()
            .eq('id_regla', idRegla);

        if (error) throw new Error(error.message);
        return { exito: true };
    } catch (error) {
        return { exito: false, error: error.message };
    }
};

// Validar regla antes de guardar
exports.ValidarRegla = function(datosRegla) {
    const errores = [];
    if (!datosRegla.nombre_regla) errores.push('nombre_regla es requerido');
    if (datosRegla.umbral_monto !== undefined && datosRegla.umbral_monto !== null && datosRegla.umbral_monto < 0)
        errores.push('umbral_monto debe ser >= 0');
    if (datosRegla.umbral_frecuencia !== undefined && datosRegla.umbral_frecuencia !== null && datosRegla.umbral_frecuencia <= 0)
        errores.push('umbral_frecuencia debe ser > 0');
    return { valida: errores.length === 0, errores };
};
