// Rutas de operaciones

const express               = require('express');
const router                = express.Router();
const controllerOperaciones = require('../controllers/operaciones.controller');

// Vista lista de operaciones
router.get('/lista', controllerOperaciones.ObtenerOperaciones);

// API JSON para el frontend (dashboard y tabla dinámica)
router.get('/api/lista', controllerOperaciones.ApiListaOperaciones);

// Formulario para registrar operacion (GET muestra form, POST guarda y redirige)
router.get('/agregar', controllerOperaciones.VistaAgregarOperacion);
router.post('/agregar', controllerOperaciones.GuardarOperacion);

// API JSON (para uso programatico desde scripts)
router.post('/api/agregar', controllerOperaciones.AgregarOperacion);

module.exports = router;
