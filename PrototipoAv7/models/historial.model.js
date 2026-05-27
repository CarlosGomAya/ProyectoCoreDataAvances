// Modelo para historial de acciones y eventos del sistema

const supabase = require('../config/supabase');

const ACCIONES_VALIDAS = new Set(['INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT']);

function normalizarAccion(accion) {
    const a = (accion || '').toUpperCase();
    return ACCIONES_VALIDAS.has(a) ? a : 'INSERT';
}

// Obtener todo el historial
exports.ObtenerHistorial = async function() {
    try {
        const { data: eventos, error } = await supabase
            .from('historial_cambios')
            .select('*')
            .order('id_historial', { ascending: false });

        if (error) throw new Error(error.message);
        return { exito: true, eventos: eventos || [] };
    } catch (error) {
        return { exito: false, eventos: [], error: error.message };
    }
};

// Obtener historial por usuario
exports.ObtenerHistorialPorUsuario = async function(idUsuario) {
    try {
        const { data: eventos, error } = await supabase
            .from('historial_cambios')
            .select('*')
            .eq('id_usuario', idUsuario)
            .order('id_historial', { ascending: false });

        if (error) throw new Error(error.message);
        return { exito: true, eventos: eventos || [] };
    } catch (error) {
        return { exito: false, eventos: [], error: error.message };
    }
};

// Historial por tipo de accion
exports.ObtenerHistorialPorAccion = async function(tipoAccion) {
    try {
        const { data: eventos, error } = await supabase
            .from('historial_cambios')
            .select('*')
            .eq('accion', normalizarAccion(tipoAccion))
            .order('id_historial', { ascending: false });

        if (error) throw new Error(error.message);
        return { exito: true, eventos: eventos || [] };
    } catch (error) {
        return { exito: false, eventos: [], error: error.message };
    }
};

// Obtener detalle de un evento
exports.ObtenerEventoPorId = async function(idEvento) {
    try {
        const { data, error } = await supabase
            .from('historial_cambios')
            .select('*')
            .eq('id_historial', idEvento)
            .single();

        if (error) throw new Error(error.message);
        return { exito: true, evento: data };
    } catch (error) {
        return { exito: false, evento: null, error: error.message };
    }
};

// Registrar nueva accion en historial
exports.RegistrarAccion = async function(datosAccion) {
    try {
        const { error } = await supabase
            .from('historial_cambios')
            .insert([{
                id_usuario:       datosAccion.id_usuario || 1,
                accion:           normalizarAccion(datosAccion.tipoaccion || datosAccion.accion),
                entidad_afectada: datosAccion.entidad_afectada || datosAccion.descripcion || null,
                fecha_hora:       new Date().toISOString(),
                valor_anterior:   datosAccion.detallesoperacion || datosAccion.valor_anterior || null,
                valor_nuevo:      datosAccion.valor_nuevo || null
            }]);

        if (error) throw new Error(error.message);
        return { exito: true };
    } catch (error) {
        return { exito: false, error: error.message };
    }
};

// Filtrar historial por rango de fechas
exports.ObtenerHistorialPorFechas = async function(fechaInicio, fechaFin) {
    try {
        const { data: eventos, error } = await supabase
            .from('historial_cambios')
            .select('*')
            .gte('fecha_hora', fechaInicio)
            .lte('fecha_hora', fechaFin + 'T23:59:59')
            .order('id_historial', { ascending: false });

        if (error) throw new Error(error.message);
        return { exito: true, eventos: eventos || [] };
    } catch (error) {
        return { exito: false, eventos: [], error: error.message };
    }
};
