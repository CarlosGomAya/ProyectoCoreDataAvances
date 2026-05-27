// tests/alertas.test.js
// Pruebas automatizadas para el módulo de Alertas PLD
// Casos cubiertos: CP-1 a CP-11
// Patrón: AAA (Arrange → Act → Assert)

const { normalizarEstatus, calcularNivelAlerta } = require('../src/alertasUtils');

// Mock de Supabase: evita conexión real a la BD
jest.mock('../config/supabase', () => ({ from: jest.fn() }));
const supabase    = require('../config/supabase');
const alertasCtrl = require('../controllers/alertas.controller');

// ═══════════════════════════════════════════════════════════════════════════
// BLOQUE 1 - alertasUtils: normalizarEstatus
// ═══════════════════════════════════════════════════════════════════════════
describe('alertasUtils - normalizarEstatus', () => {

    test('CP-1 - estatus ABIERTA → Pendiente', () => {
        // Arrange
        const dbEstatus = 'ABIERTA';

        // Act
        const resultado = normalizarEstatus(dbEstatus);

        // Assert
        expect(resultado).toBe('Pendiente');
    });

    test('CP-2 - estatus PENDIENTE → Pendiente', () => {
        // Arrange
        const dbEstatus = 'PENDIENTE';

        // Act
        const resultado = normalizarEstatus(dbEstatus);

        // Assert
        expect(resultado).toBe('Pendiente');
    });

    test('CP-3 - estatus EN_REVISION → En revision', () => {
        // Arrange
        const dbEstatus = 'EN_REVISION';

        // Act
        const resultado = normalizarEstatus(dbEstatus);

        // Assert
        expect(resultado).toBe('En revision');
    });

    test('CP-4 - estatus CERRADA → Resuelta', () => {
        // Arrange
        const dbEstatus = 'CERRADA';

        // Act
        const resultado = normalizarEstatus(dbEstatus);

        // Assert
        expect(resultado).toBe('Resuelta');
    });

    test('CP-5 - estatus desconocido → Pendiente por defecto', () => {
        // Arrange
        const dbEstatus = 'INVALIDO';

        // Act
        const resultado = normalizarEstatus(dbEstatus);

        // Assert
        expect(resultado).toBe('Pendiente');
    });

});

// ═══════════════════════════════════════════════════════════════════════════
// BLOQUE 2 - alertasUtils: calcularNivelAlerta
// ═══════════════════════════════════════════════════════════════════════════
describe('alertasUtils - calcularNivelAlerta', () => {

    test('CP-6 - tipo contiene "relevante" → nivel Alto', () => {
        // Arrange
        const tipoAlerta = 'Operación relevante';

        // Act
        const nivel = calcularNivelAlerta(tipoAlerta);

        // Assert
        expect(nivel).toBe('Alto');
    });

    test('CP-7 - tipo contiene "inusual" → nivel Medio', () => {
        // Arrange
        const tipoAlerta = 'Operación inusual';

        // Act
        const nivel = calcularNivelAlerta(tipoAlerta);

        // Assert
        expect(nivel).toBe('Medio');
    });

    test('CP-8 - tipo sin palabras clave → nivel Bajo', () => {
        // Arrange
        const tipoAlerta = 'Movimiento general';

        // Act
        const nivel = calcularNivelAlerta(tipoAlerta);

        // Assert
        expect(nivel).toBe('Bajo');
    });

});

// ═══════════════════════════════════════════════════════════════════════════
// BLOQUE 3 - Controlador: ApiResolverAlerta
// ═══════════════════════════════════════════════════════════════════════════
describe('ApiResolverAlerta - controlador', () => {

    function mockReqRes(body) {
        const req = { body };
        const res = {
            status: jest.fn().mockReturnThis(),
            json:   jest.fn()
        };
        return { req, res };
    }

    test('CP-9 - sin idAlerta → 400 con mensaje que indica campo faltante', async () => {
        // Arrange
        const { req, res } = mockReqRes({ resolucion: 'texto de resolución' });

        // Act
        await alertasCtrl.ApiResolverAlerta(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ msg: expect.stringContaining('idAlerta') })
        );
    });

    test('CP-10 - idAlerta válido y Supabase disponible → responde {exito: true}', async () => {
        // Arrange
        supabase.from.mockReturnValue({
            update: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ error: null })
            })
        });
        const { req, res } = mockReqRes({ idAlerta: 5, resolucion: 'Caso cerrado' });

        // Act
        await alertasCtrl.ApiResolverAlerta(req, res);

        // Assert
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ exito: true })
        );
    });

    test('CP-11 - error en Supabase → modelo retorna {exito: false}, respuesta con exito: false', async () => {
        // Arrange
        supabase.from.mockReturnValue({
            update: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ error: { message: 'DB error' } })
            })
        });
        const { req, res } = mockReqRes({ idAlerta: 5, resolucion: '' });

        // Act
        await alertasCtrl.ApiResolverAlerta(req, res);

        // Assert
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ exito: false })
        );
    });

});
