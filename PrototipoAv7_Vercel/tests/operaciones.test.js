// tests/operaciones.test.js
// Pruebas automatizadas para el módulo de Operaciones Financieras
// Casos cubiertos: CP-1 a CP-8
// Patrón: AAA (Arrange → Act → Assert)

const { validarCamposOperacion } = require('../src/operacionUtils');

// Mock de Supabase: evita conexión real a la BD
jest.mock('../config/supabase', () => ({ from: jest.fn() }));
const supabase         = require('../config/supabase');
const modelOperaciones = require('../models/operaciones.model');

// ═══════════════════════════════════════════════════════════════════════════
// BLOQUE 1 - operacionUtils: validarCamposOperacion
// ═══════════════════════════════════════════════════════════════════════════
describe('operacionUtils - validarCamposOperacion', () => {

    test('CP-1 - todos los campos vacíos → inválido con mensaje de error', () => {
        // Arrange
        const datos = { idcliente: '', tipooperacion: '', monto: '', fecha: '' };

        // Act
        const resultado = validarCamposOperacion(datos);

        // Assert
        expect(resultado.valido).toBe(false);
        expect(resultado.mensaje).toContain('obligatorios');
    });

    test('CP-2 - falta idcliente, resto presentes → inválido', () => {
        // Arrange
        const datos = { idcliente: '', tipooperacion: 'Deposito', monto: '5000', fecha: '2026-01-01' };

        // Act
        const resultado = validarCamposOperacion(datos);

        // Assert
        expect(resultado.valido).toBe(false);
    });

    test('CP-3 - falta tipooperacion, resto presentes → inválido', () => {
        // Arrange
        const datos = { idcliente: '1', tipooperacion: '', monto: '5000', fecha: '2026-01-01' };

        // Act
        const resultado = validarCamposOperacion(datos);

        // Assert
        expect(resultado.valido).toBe(false);
    });

    test('CP-4 - falta monto, resto presentes → inválido', () => {
        // Arrange
        const datos = { idcliente: '1', tipooperacion: 'Deposito', monto: '', fecha: '2026-01-01' };

        // Act
        const resultado = validarCamposOperacion(datos);

        // Assert
        expect(resultado.valido).toBe(false);
    });

    test('CP-5 - falta fecha, resto presentes → inválido', () => {
        // Arrange
        const datos = { idcliente: '1', tipooperacion: 'Deposito', monto: '5000', fecha: '' };

        // Act
        const resultado = validarCamposOperacion(datos);

        // Assert
        expect(resultado.valido).toBe(false);
    });

    test('CP-6 - todos los campos presentes → válido, mensaje vacío', () => {
        // Arrange
        const datos = { idcliente: '1', tipooperacion: 'Deposito', monto: '5000', fecha: '2026-01-01' };

        // Act
        const resultado = validarCamposOperacion(datos);

        // Assert
        expect(resultado.valido).toBe(true);
        expect(resultado.mensaje).toBe('');
    });

});

// ═══════════════════════════════════════════════════════════════════════════
// BLOQUE 2 - Modelo: AgregarOperacion (Supabase mockeado)
// ═══════════════════════════════════════════════════════════════════════════
describe('AgregarOperacion - modelo (Supabase mockeado)', () => {

    const datosValidos = {
        idcliente:     '3',
        tipooperacion: 'Deposito',
        monto:         '75000',
        moneda:        'MXN',
        fecha:         '2026-01-15'
    };

    test('CP-7 - datos válidos y Supabase disponible → {exito: true} con operacion', async () => {
        // Arrange
        supabase.from.mockReturnValue({
            insert: jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue({
                    data:  [{ id_operacion: 10, tipo_operacion: 'Deposito', monto: 75000 }],
                    error: null
                })
            })
        });

        // Act
        const resultado = await modelOperaciones.AgregarOperacion(datosValidos);

        // Assert
        expect(resultado.exito).toBe(true);
        expect(resultado.operacion).toBeDefined();
    });

    test('CP-8 - error de Supabase → {exito: false} con mensaje de error', async () => {
        // Arrange
        supabase.from.mockReturnValue({
            insert: jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue({
                    data:  null,
                    error: { message: 'insert violates foreign key constraint' }
                })
            })
        });

        // Act
        const resultado = await modelOperaciones.AgregarOperacion(datosValidos);

        // Assert
        expect(resultado.exito).toBe(false);
        expect(resultado.error).toBeDefined();
    });

});
