// Acciones y eventos en el sistema

const express = require('express');
const router = express.Router();
const controllerHistorial = require('../controllers/historial.controller');

// Vista principal
router.get('/lista', controllerHistorial.ObtenerHistorial);

// API JSON para el frontend
router.get('/api/lista',    controllerHistorial.ApiListaHistorial);
router.get('/api/filtrar',  controllerHistorial.ApiFiltrarHistorial);

// Endpoints de filtrado (mantener compatibilidad con rutas existentes)
router.get('/usuario',  controllerHistorial.HistorialPorUsuario);
router.get('/accion',   controllerHistorial.HistorialPorAccion);
router.get('/detalle',  controllerHistorial.DetalleEvento);

module.exports = router;
