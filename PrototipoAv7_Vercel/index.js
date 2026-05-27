// index

//Librerias no tocar
const express    = require('express');
const bodyParser = require('body-parser');
const path       = require('path');
const fileUpload = require('express-fileupload');
const app = express();

const modelClientes    = require('./models/clientes.model');
const modelOperaciones = require('./models/operaciones.model');
const modelAlertas     = require('./models/alertas.model');

// Credenciales de acceso rapido para pruebas
const usuarioDemo = {
    correo: 'demo@sofom.mx',
    password: 'demo123'
};

// Notificar el uso de ejs
app.set('view engine', 'ejs');
app.set('views', 'views');

// Middleware para archivos
app.use(fileUpload());

// Middleware para parsear datos
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// jala los archivos que esten publicos
app.use(express.static(path.join(__dirname, 'public')));

// Marca la ruta activa para resaltarla en la navegacion
app.use((req, res, next) => {
    res.locals.currentPath = req.path;
    next();
});

//Conocer el estado del servidor
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// rutas a clientes
const rutasClientes = require('./routes/clientes.routes');
app.use('/clientes', rutasClientes);

// rutas a operaciones
const rutasOperaciones = require('./routes/operaciones.routes');
app.use('/operaciones', rutasOperaciones);

// rutas a alertas
const rutasAlertas = require('./routes/alertas.routes');
app.use('/alertas', rutasAlertas);

// Rutas de contratos
const rutasContratos = require('./routes/contratos.routes');
app.use('/contratos', rutasContratos);

// Rutas de reportes
const rutasReportes = require('./routes/reportes.routes');
app.use('/reportes', rutasReportes);

// Rutas de admin
const rutasAdmin = require('./routes/admin.routes');
app.use('/admin', rutasAdmin);

// Rutas de reglas
const rutasReglas = require('./routes/reglas.routes');
app.use('/reglas', rutasReglas);

// Rutas de historial
const rutasHistorial = require('./routes/historial.routes');
app.use('/historial', rutasHistorial);

// Rutas de login
const rutasLogin = require('./routes/login.routes');
app.use('/login', rutasLogin);

// Ruta raiz redirige al login
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Dashboard principal despues del inicio de sesion
app.get('/dashboard', (req, res) => {
    res.render('dashboard');
});

// API para los contadores del dashboard
app.get('/api/dashboard', async (req, res) => {
    try {
        const resultadoClientes    = await modelClientes.ObtenerClientesLista();
        const resultadoOperaciones = await modelOperaciones.ObtenerOperaciones();
        const resultadoAlertas     = await modelAlertas.ObtenerAlertas();

        const clientes    = resultadoClientes.clientes || [];
        const operaciones = resultadoOperaciones.operaciones || [];
        const alertas     = resultadoAlertas.alertas || [];

        const alertasAbiertas = alertas.filter(function(a) { return a.estatus === 'ABIERTA'; });

        res.json({
            totalClientes:          clientes.length,
            totalOperaciones:       operaciones.length,
            totalAlertasPendientes: alertasAbiertas.length,
            totalReportesListos: 0,
            alertasRecientes: alertasAbiertas.slice(0, 4).map(function(a) {
                return { tipo: a.tipo_alerta, fecha: a.fecha_generacion };
            }),
            distribucionRiesgo: {
                bajo:  clientes.filter(function(c) { return (c.nivel_riesgo || '').toUpperCase() === 'BAJO'; }).length,
                medio: clientes.filter(function(c) { return (c.nivel_riesgo || '').toUpperCase() === 'MEDIO'; }).length,
                alto:  clientes.filter(function(c) { return (c.nivel_riesgo || '').toUpperCase() === 'ALTO'; }).length
            }
        });
    } catch (error) {
        res.json({
            totalClientes: 0,
            totalOperaciones: 0,
            totalAlertasPendientes: 0,
            totalReportesListos: 0,
            alertasRecientes: [],
            distribucionRiesgo: { bajo: 0, medio: 0, alto: 0 }
        });
    }
});

// Manejador de errores global
app.use((error, req, res, next) => {
    console.error(error.message);

    if (req.path.includes('/api/')) {
        res.status(503).json({
            msg: 'No fue posible consultar la base de datos',
            detalle: error.message
        });
        return;
    }

    next(error);
});

// Solo levanta el servidor local si NO estamos en Vercel
if (!process.env.VERCEL) {
    const server = app.listen(3000, () => {
        console.log('http://localhost:3000');
    });

    process.on('SIGINT', () => {
        server.close(() => {
            process.exit(0);
        });
    });
}

// Exporta el app para que Vercel lo use como funcion serverless
module.exports = app;
