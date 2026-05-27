// Controller login y autenticacion

const modelLogin = require('../models/login.model');

const usuarioDemo = {
    correo:   'demo@sofom.mx',
    password: 'demo123'
};

// Vista de login
module.exports.VistaLogin = async (req, res) => {
    res.render('./login/login', {
        usuarioDemo: usuarioDemo,
        mensaje:     req.query.mensaje || null
    });
};

// Procesar login: verifica demo primero, luego Supabase
module.exports.ProcesarLogin = async (req, res) => {
    const { correo, password } = req.body;

    if (correo === usuarioDemo.correo && password === usuarioDemo.password) {
        return res.redirect('/dashboard');
    }

    try {
        const usuario = await modelLogin.ValidarCredenciales(correo, password);

        if (usuario) {
            return res.redirect('/dashboard');
        }

        res.redirect('/login?mensaje=Datos incorrectos. Verifica tu correo y contrasena.');
    } catch (error) {
        res.redirect('/login?mensaje=No fue posible conectar con la base de datos.');
    }
};

// Logout
module.exports.Logout = async (req, res) => {
    res.redirect('/login');
};

// Vista de registro
module.exports.VistaRegistro = async (req, res) => {
    res.render('./login/login', {
        usuarioDemo: usuarioDemo,
        mensaje:     null
    });
};

// Procesar registro
module.exports.ProcesarRegistro = async (req, res) => {
    res.redirect('/login');
};
