// Reglas umbrales y criterios esto sirve para definir 

const express = require('express');
const router = express.Router();
const controllerReglas = require('../controllers/reglas.controller');

// API: devuelve reglas como JSON
router.get('/api/lista', controllerReglas.ApiListaReglas);

// API: editar regla
router.post('/api/editar', controllerReglas.ApiEditarRegla);

// Listar todas las reglas
router.get('/lista', controllerReglas.ObtenerReglas);

// Ver formulario para agregar regla
router.get('/agregar', controllerReglas.VistaAgregarRegla);

// Agregar nueva regla
router.post('/agregar', controllerReglas.AgregarRegla);

// Ver formulario para editar regla
router.get('/editar', controllerReglas.VistaEditarRegla);

// Editar regla existente
router.post('/editar', controllerReglas.EditarRegla);

// Eliminar regla
router.post('/eliminar', controllerReglas.EliminarRegla);

module.exports = router;