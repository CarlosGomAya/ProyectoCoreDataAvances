// Rutas para las alertas

const express           = require('express');
const router            = express.Router();
const controllerAlertas = require('../controllers/alertas.controller');

// Vista lista de alertas
router.get('/lista', controllerAlertas.ObtenerAlertas);

// API JSON para el frontend
router.get('/api/lista',    controllerAlertas.ApiListaAlertas);
router.post('/api/resolver', controllerAlertas.ApiResolverAlerta);
router.post('/api/estatus',  controllerAlertas.ApiCambiarEstatus);

// Vista detalle de alerta
router.get('/detalle', controllerAlertas.VistaDetalleAlerta);

// Procesar resolucion desde el detalle
router.post('/resolver-detalle', controllerAlertas.ProcesarResolucion);

// Formulario resolver (legado)
router.get('/resolver',  controllerAlertas.VistaResolverAlerta);
router.post('/resolver', controllerAlertas.ResolverAlerta);

module.exports = router;
