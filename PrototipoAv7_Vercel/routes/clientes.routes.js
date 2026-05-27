// Route de clientes

const express            = require('express');
const router             = express.Router();
const controllerClientes = require('../controllers/clientes.controller');

// mostrar todos los clientes
router.get('/lista', controllerClientes.ObtenerClientes);

// API JSON para el dashboard y tablas dinamicas
router.get('/api/lista', controllerClientes.ApiListaClientes);

// nuevo expediente de cliente (formulario de 3 pasos)
router.get('/expediente', controllerClientes.VistaExpedienteCliente);
router.post('/expediente', controllerClientes.GuardarExpediente);

// agregar cliente (apunta al expediente)
router.get('/agregar', controllerClientes.VistaAgregarCliente);
router.post('/agregar', controllerClientes.AgregarCliente);

// editar cliente (ver datos)
router.get('/editar', controllerClientes.VistaEditarCliente);
router.post('/editar', controllerClientes.EditarCliente);

// eliminar cliente
router.post('/eliminar', controllerClientes.EliminarCliente);

// RF-05: documentos del cliente
router.get('/documentos', controllerClientes.VistaDocumentosCliente);
router.post('/validar-documento', controllerClientes.ValidarDocumento);

// importar clientes desde CSV
router.post('/importar-csv', controllerClientes.ImportarCSV);

module.exports = router;
