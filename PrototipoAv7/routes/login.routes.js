// autenticacion y login

const express = require('express');
const router = express.Router();
const controllerLogin = require('../controllers/login.controller');

// Vista de login
router.get('/', controllerLogin.VistaLogin);

// Procesar login
router.post('/', controllerLogin.ProcesarLogin);

// Logout
router.get('/logout', controllerLogin.Logout);

// Registro de nuevo usuario
router.get('/registro', controllerLogin.VistaRegistro);

// Procesar registro
router.post('/registro', controllerLogin.ProcesarRegistro);

module.exports = router;