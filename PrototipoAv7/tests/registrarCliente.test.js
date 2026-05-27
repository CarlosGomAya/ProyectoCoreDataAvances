// tests/registrarCliente.test.js
// Pruebas automatizadas para el módulo de Registro de Cliente - SOFOM Core Data Consulting
// Casos cubiertos: TC-RC-001 a TC-RC-008, TC-RC-015, TC-RC-016 (del documento de casos de prueba)
// Patrón: AAA (Arrange → Act → Assert)

const { calcularNivelRiesgo, validarCamposPaso1 } = require('../src/clienteUtils');

// ─── Mock de Supabase: evita conexión real a la BD ─────────────────────────
jest.mock('../config/supabase', () => ({ from: jest.fn() }));
const supabase      = require('../config/supabase');
const modelClientes = require('../models/clientes.model');

// ═══════════════════════════════════════════════════════════════════════════
// BLOQUE 1 - clienteUtils: validarCamposPaso1
// ═══════════════════════════════════════════════════════════════════════════
describe('clienteUtils - validarCamposPaso1', () => {

    test('TC-RC-001 - nombre y RFC vacíos → inválido con mensaje de error', () => {
        // Arrange
        const nombre = '';
        const rfc    = '';

        // Act
        const resultado = validarCamposPaso1(nombre, rfc);

        // Assert
        expect(resultado.valido).toBe(false);
        expect(resultado.mensaje).toContain('obligatorios');
    });

    test('TC-RC-002 - nombre vacío con RFC presente → inválido', () => {
        // Arrange
        const nombre = '';
        const rfc    = 'GALJ850312AB1';

        // Act
        const resultado = validarCamposPaso1(nombre, rfc);

        // Assert
        expect(resultado.valido).toBe(false);
    });

    test('TC-RC-003 - RFC vacío con nombre presente → inválido', () => {
        // Arrange
        const nombre = 'Juan García López';
        const rfc    = '';

        // Act
        const resultado = validarCamposPaso1(nombre, rfc);

        // Assert
        expect(resultado.valido).toBe(false);
    });

    test('TC-RC-004 - nombre y RFC presentes → válido, mensaje vacío', () => {
        // Arrange
        const nombre = 'Juan García';
        const rfc    = 'GALJ850312AB1';

        // Act
        const resultado = validarCamposPaso1(nombre, rfc);

        // Assert
        expect(resultado.valido).toBe(true);
        expect(resultado.mensaje).toBe('');
    });

    test('nombre con solo espacios se trata como vacío → inválido', () => {
        // Arrange
        const nombre = '   ';
        const rfc    = 'GALJ850312AB1';

        // Act
        const resultado = validarCamposPaso1(nombre, rfc);

        // Assert
        expect(resultado.valido).toBe(false);
    });

});

// ═══════════════════════════════════════════════════════════════════════════
// BLOQUE 2 - clienteUtils: calcularNivelRiesgo
// ═══════════════════════════════════════════════════════════════════════════
describe('clienteUtils - calcularNivelRiesgo', () => {

    test('TC-RC-005 - cliente PEP → nivel Alto sin importar el límite', () => {
        // Arrange
        const esPEP          = true;
        const limiteOperativo = 0;

        // Act
        const nivel = calcularNivelRiesgo(esPEP, limiteOperativo);

        // Assert
        expect(nivel).toBe('Alto');
    });

    test('TC-RC-006 - límite >= $1,500,000 sin PEP → nivel Medio', () => {
        // Arrange
        const esPEP           = false;
        const limiteOperativo = 2000000;

        // Act
        const nivel = calcularNivelRiesgo(esPEP, limiteOperativo);

        // Assert
        expect(nivel).toBe('Medio');
    });

    test('TC-RC-007 - límite < $1,500,000 sin PEP → nivel Bajo', () => {
        // Arrange
        const esPEP           = false;
        const limiteOperativo = 500000;

        // Act
        const nivel = calcularNivelRiesgo(esPEP, limiteOperativo);

        // Assert
        expect(nivel).toBe('Bajo');
    });

    test('TC-RC-008 - PEP tiene prioridad sobre límite alto → sigue siendo Alto', () => {
        // Arrange
        const esPEP           = true;
        const limiteOperativo = 5000000;   // límite muy alto, pero PEP manda

        // Act
        const nivel = calcularNivelRiesgo(esPEP, limiteOperativo);

        // Assert
        expect(nivel).toBe('Alto');
    });

    test('valor frontera exacto $1,500,000 sin PEP → Medio (incluye el umbral)', () => {
        // Arrange
        const esPEP           = false;
        const limiteOperativo = 1500000;

        // Act
        const nivel = calcularNivelRiesgo(esPEP, limiteOperativo);

        // Assert
        expect(nivel).toBe('Medio');
    });

    test('valor $1,499,999 sin PEP → Bajo (justo bajo el umbral)', () => {
        // Arrange
        const esPEP           = false;
        const limiteOperativo = 1499999;

        // Act
        const nivel = calcularNivelRiesgo(esPEP, limiteOperativo);

        // Assert
        expect(nivel).toBe('Bajo');
    });

    test('límite cero sin PEP → Bajo', () => {
        // Arrange
        const esPEP           = false;
        const limiteOperativo = 0;

        // Act
        const nivel = calcularNivelRiesgo(esPEP, limiteOperativo);

        // Assert
        expect(nivel).toBe('Bajo');
    });

});

// ═══════════════════════════════════════════════════════════════════════════
// BLOQUE 3 - Modelo: GuardarCliente (Supabase mockeado)
// ═══════════════════════════════════════════════════════════════════════════
describe('GuardarCliente - modelo (Supabase mockeado)', () => {

    const datosClienteValidos = {
        nombre:          'María López',
        tipoCliente:     'Fisica',
        rfc:             'LOPM900115JK8',
        curp:            'LOPM900115MDFPZR01',
        estatusCliente:  'Activo',
        contactoPrincipal: 'María López',
        telefono:        '5512345678',
        correo:          'maria@ejemplo.com',
        calle:           'Av. Insurgentes 123',
        colonia:         'Del Valle',
        ciudad:          'CDMX',
        estado:          'CDMX',
        codigoPostal:    '03100',
        nivelRiesgo:     'Bajo',
        esPEP:           'No',
        limiteOperativo: '100000',
        observaciones:   ''
    };

    test('TC-RC-015 - guardado exitoso retorna exito:true e idCliente', async () => {
        // Arrange — Supabase responde con el registro insertado
        supabase.from.mockReturnValue({
            insert: jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue({
                    data:  [{ id_cliente: 42 }],
                    error: null
                })
            })
        });

        // Act
        const resultado = await modelClientes.GuardarCliente(datosClienteValidos, {});

        // Assert
        expect(resultado.exito).toBe(true);
        expect(resultado.idCliente).toBe(42);
    });

    test('TC-RC-016 - error de Supabase retorna exito:false con mensaje de error', async () => {
        // Arrange — Supabase reporta un error (ej. violación de constraint)
        supabase.from.mockReturnValue({
            insert: jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue({
                    data:  null,
                    error: { message: 'duplicate key value violates unique constraint' }
                })
            })
        });

        // Act
        const resultado = await modelClientes.GuardarCliente(datosClienteValidos, {});

        // Assert
        expect(resultado.exito).toBe(false);
        expect(resultado.error).toBeDefined();
    });

});
