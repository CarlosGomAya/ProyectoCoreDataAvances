// Controlador de administracion de usuarios

const supabase = require('../config/supabase');

// Vista lista de usuarios
module.exports.ListaUsuarios = async (req, res) => {
    res.render('./admin/lista_admin', {
        mensaje: req.query.mensaje || null
    });
};

// API: devuelve usuarios como JSON para el frontend
module.exports.ApiListaUsuarios = async (req, res) => {
    try {
        const { data: rows, error } = await supabase
            .from('usuario')
            .select('*, rol(nombre_rol)')
            .order('id_usuario', { ascending: false });

        if (error) throw new Error(error.message);

        const usuarios = (rows || []).map(function(u) {
            return {
                idUsuario: u.id_usuario,
                nombre:    u.nombre   || '',
                apellido:  u.apellido || '',
                correo:    u.email    || '',
                idRol:     u.id_rol   || null,
                rol:       u.rol ? u.rol.nombre_rol : 'Usuario',
                activo:    u.activo !== false,
                estado:    u.activo === false ? 'Inactivo' : 'Activo'
            };
        });

        res.json({ usuarios: usuarios });
    } catch (error) {
        res.json({ usuarios: [], nota: 'Error al obtener usuarios: ' + error.message });
    }
};

// API: lista de roles disponibles
module.exports.ApiListaRoles = async (req, res) => {
    try {
        const { data: roles, error } = await supabase
            .from('rol')
            .select('id_rol, nombre_rol')
            .order('id_rol', { ascending: true });

        if (error) throw new Error(error.message);

        res.json({
            roles: (roles || []).map(function(r) {
                return { idRol: r.id_rol, nombre: r.nombre_rol };
            })
        });
    } catch (error) {
        res.json({ roles: [], error: error.message });
    }
};

// API: editar usuario existente
module.exports.ApiEditarUsuario = async (req, res) => {
    try {
        const { idUsuario, nombre, apellido, correo, idRol, activo } = req.body;

        if (!idUsuario || !nombre || !correo) {
            return res.status(400).json({ exito: false, error: 'Faltan datos requeridos' });
        }

        const datos = {
            nombre:   nombre,
            apellido: apellido || null,
            email:    correo,
            activo:   activo !== false && activo !== 'false'
        };

        if (idRol) datos.id_rol = idRol;

        const { error } = await supabase
            .from('usuario')
            .update(datos)
            .eq('id_usuario', idUsuario);

        if (error) throw new Error(error.message);

        res.json({ exito: true });
    } catch (error) {
        res.status(500).json({ exito: false, error: error.message });
    }
};
