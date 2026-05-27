// Rutas admin

const express        = require('express');
const router         = express.Router();
const controllerAdmin = require('../controllers/admin.controller');

// Vista lista de usuarios
router.get('/lista', controllerAdmin.ListaUsuarios);

// API JSON para el frontend
router.get('/api/lista',  controllerAdmin.ApiListaUsuarios);
router.get('/api/roles',  controllerAdmin.ApiListaRoles);
router.post('/api/editar', controllerAdmin.ApiEditarUsuario);

module.exports = router;
