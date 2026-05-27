// Rutas de reportes

const express            = require('express');
const router             = express.Router();
const controllerReportes = require('../controllers/reportes.controller');

// Vista lista de reportes
router.get('/lista', controllerReportes.LoginReportes);

// API JSON para el frontend
router.get('/api/lista', controllerReportes.ApiListaReportes);

module.exports = router;
