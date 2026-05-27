// autenticacion y login

const supabase = require('../config/supabase');

// Validar credenciales contra la tabla usuario en Supabase
exports.ValidarCredenciales = async function(correo, password) {
    try {
        const { data: usuarios, error } = await supabase
            .from('usuario')
            .select('*, rol(nombre_rol)')
            .eq('email', correo)
            .eq('activo', true)
            .limit(1);

        if (error || !usuarios || usuarios.length === 0) {
            return null;
        }

        const usuario = usuarios[0];

        if (usuario.contrasena !== password) {
            return null;
        }

        return {
            id:     usuario.id_usuario,
            nombre: [usuario.nombre || '', usuario.apellido || ''].join(' ').trim(),
            correo: usuario.email,
            rol:    usuario.rol?.nombre_rol || 'Usuario'
        };
    } catch (err) {
        throw new Error('Error al conectar con la base de datos: ' + err.message);
    }
};
