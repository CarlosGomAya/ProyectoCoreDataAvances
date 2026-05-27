// tests/reglas.test.js
// Pruebas automatizadas para el módulo de Reglas PLD
// Casos cubiertos: CP-1 a CP-9
// Patrón: AAA (Arrange → Act → Assert)

// Mock de Supabase: evita conexión real a la BD
jest.mock('../config/supabase', () => ({ from: jest.fn() }));
const supabase    = require('../config/supabase');
const modelReglas = require('../models/reglas.model');
const reglasCtrl  = require('../controllers/reglas.controller');

// ═══════════════════════════════════════════════════════════════════════════
// BLOQUE 1 - reglas.model: ValidarRegla (función pura, sin BD)
// ═══════════════════════════════════════════════════════════════════════════
describe('reglas.model - ValidarRegla', () => {

    test('CP-1 - nombre vacío → inválida con error descriptivo', () => {
        // Arrange
        const datos = { nombre_regla: '' };

        // Act
        const resultado = modelReglas.ValidarRegla(datos);

        // Assert
        expect(resultado.valida).toBe(false);
        expect(resultado.errores).toEqual(
            expect.arrayContaining([expect.stringContaining('nombre_regla')])
        );
    });

    test('CP-2 - nombre presente y umbrales válidos → válida, sin errores', () => {
        // Arrange
        const datos = { nombre_regla: 'Operación grande', umbral_monto: 50000 };

        // Act
        const resultado = modelReglas.ValidarRegla(datos);

        // Assert
        expect(resultado.valida).toBe(true);
        expect(resultado.errores).toHaveLength(0);
    });

    test('CP-3 - umbral_monto negativo → inválida con error de monto', () => {
        // Arrange
        const datos = { nombre_regla: 'Test', umbral_monto: -100 };

        // Act
        const resultado = modelReglas.ValidarRegla(datos);

        // Assert
        expect(resultado.valida).toBe(false);
        expect(resultado.errores).toEqual(
            expect.arrayContaining([expect.stringContaining('umbral_monto')])
        );
    });

    test('CP-4 - umbral_frecuencia igual a 0 → inválida (debe ser > 0)', () => {
        // Arrange
        const datos = { nombre_regla: 'Test', umbral_frecuencia: 0 };

        // Act
        const resultado = modelReglas.ValidarRegla(datos);

        // Assert
        expect(resultado.valida).toBe(false);
        expect(resultado.errores).toEqual(
            expect.arrayContaining([expect.stringContaining('umbral_frecuencia')])
        );
    });

    test('CP-5 - umbral_frecuencia positivo → válida', () => {
        // Arrange
        const datos = { nombre_regla: 'Test frecuencia', umbral_frecuencia: 5 };

        // Act
        const resultado = modelReglas.ValidarRegla(datos);

        // Assert
        expect(resultado.valida).toBe(true);
    });

});

// ═══════════════════════════════════════════════════════════════════════════
// BLOQUE 2 - Controlador: ApiEditarRegla
// ═══════════════════════════════════════════════════════════════════════════
describe('ApiEditarRegla - controlador', () => {

    function mockReqRes(body) {
        const req = { body };
        const res = {
            status: jest.fn().mockReturnThis(),
            json:   jest.fn()
        };
        return { req, res };
    }

    test('CP-6 - sin idRegla → 400 con {exito: false}', async () => {
        // Arrange
        const { req, res } = mockReqRes({ nombre: 'Regla sin ID' });

        // Act
        await reglasCtrl.ApiEditarRegla(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ exito: false })
        );
    });

    test('CP-7 - sin nombre → 400 con {exito: false}', async () => {
        // Arrange
        const { req, res } = mockReqRes({ idRegla: 1 });

        // Act
        await reglasCtrl.ApiEditarRegla(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ exito: false })
        );
    });

    test('CP-8 - idRegla y nombre presentes, Supabase disponible → {exito: true}', async () => {
        // Arrange
        supabase.from.mockReturnValue({
            update: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ error: null })
            })
        });
        const { req, res } = mockReqRes({ idRegla: 1, nombre: 'Regla actualizada', monto: 75000 });

        // Act
        await reglasCtrl.ApiEditarRegla(req, res);

        // Assert
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ exito: true })
        );
    });

    test('CP-9 - error de Supabase → 400 con {exito: false}', async () => {
        // Arrange
        supabase.from.mockReturnValue({
            update: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ error: { message: 'update failed' } })
            })
        });
        const { req, res } = mockReqRes({ idRegla: 2, nombre: 'Regla test' });

        // Act
        await reglasCtrl.ApiEditarRegla(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ exito: false })
        );
    });

});
