// Funciones puras de lógica de login — extraídas del controlador para permitir testing aislado

const USUARIO_DEMO = {
    correo:   'demo@sofom.mx',
    password: 'demo123'
};

/**
 * Verifica si las credenciales coinciden con el usuario demo (sin red, sin BD).
 * @param {string} correo
 * @param {string} password
 * @returns {boolean}
 */
function esCredencialDemo(correo, password) {
    return correo === USUARIO_DEMO.correo && password === USUARIO_DEMO.password;
}

/**
 * Mapea una fila de la tabla `usuario` al objeto de perfil que usa la aplicación.
 * @param {object} row - Fila cruda de Supabase
 * @returns {{ id, nombre, correo, rol }}
 */
function construirPerfil(row) {
    return {
        id:     row.idusuario || row.id_usuario || row.id,
        nombre: [row.nombre || '', row.apellido || ''].join(' ').trim(),
        correo: row.correo,
        rol:    row.rol || 'Usuario'
    };
}

module.exports = { USUARIO_DEMO, esCredencialDemo, construirPerfil };
