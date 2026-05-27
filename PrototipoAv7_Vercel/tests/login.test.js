// Pruebas automatizadas para el módulo de Login
// Casos cubiertos: CP-1, CP-2, CP-3, CP-7 del documento apartado de casos de prueba

const { esCredencialDemo, construirPerfil, USUARIO_DEMO } = require('../src/loginUtils');

// Mock de Supabase: evita conexión real a la BD 
jest.mock('../config/supabase', () => ({ from: jest.fn() }));
const supabase = require('../config/supabase');

const modelLogin    = require('../models/login.model');
const loginCtrl     = require('../controllers/login.controller');

// 1 - loginUtils: esCredencialDemo
describe('loginUtils - esCredencialDemo', () => {

    test('TC-001 - credenciales demo correctas retornan true', () => {
        // Arrange
        const correo   = 'demo@sofom.mx';
        const password = 'demo123';

        // Act
        const resultado = esCredencialDemo(correo, password);

        // Assert
        expect(resultado).toBe(true);
    });

    test('TC-002 - correo incorrecto retorna false', () => {
        // Arrange
        const correo   = 'usuario@sofom.mx';
        const password = 'demo123';

        // Act
        const resultado = esCredencialDemo(correo, password);

        // Assert
        expect(resultado).toBe(false);
    });

    test('TC-003 - contraseña incorrecta retorna false', () => {
        // Arrange
        const correo   = 'demo@sofom.mx';
        const password = '123456';

        // Act
        const resultado = esCredencialDemo(correo, password);

        // Assert
        expect(resultado).toBe(false);
    });

    test('TC-003b - ambos datos incorrectos retornan false', () => {
        // Arrange
        const correo   = 'otro@correo.com';
        const password = 'wrongpass';

        // Act
        const resultado = esCredencialDemo(correo, password);

        // Assert
        expect(resultado).toBe(false);
    });

});

// 2 - loginUtils: construirPerfil
describe('loginUtils - construirPerfil', () => {

    test('mapea una fila de BD con todos los campos al objeto de perfil correcto', () => {
        // Arrange
        const fila = {
            idusuario: 7,
            nombre:    'Ana',
            apellido:  'Pérez',
            correo:    'ana@sofom.mx',
            rol:       'Admin'
        };

        // Act
        const perfil = construirPerfil(fila);

        // Assert
        expect(perfil).toEqual({
            id:     7,
            nombre: 'Ana Pérez',
            correo: 'ana@sofom.mx',
            rol:    'Admin'
        });
    });

    test('cuando no hay apellido, nombre queda solo sin espacios extra', () => {
        // Arrange
        const fila = { idusuario: 3, nombre: 'Carlos', apellido: '', correo: 'c@s.mx', rol: 'Usuario' };

        // Act
        const perfil = construirPerfil(fila);

        // Assert
        expect(perfil.nombre).toBe('Carlos');
    });

    test('rol por defecto es "Usuario" cuando la fila no lo trae', () => {
        // Arrange
        const fila = { idusuario: 1, nombre: 'Luis', correo: 'l@s.mx' };

        // Act
        const perfil = construirPerfil(fila);

        // Assert
        expect(perfil.rol).toBe('Usuario');
    });

});

// 3 - Modelo: ValidarCredenciales (Supabase con mock)
describe('ValidarCredenciales - modelo (Supabase con mock)', () => {

    // Función auxiliar para configurar la cadena from().select().eq().eq().limit()
    // El modelo usa dos .eq(): uno para email y otro para activo:true
    function mockSupabaseRespuesta(data, error) {
        supabase.from.mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue({ data, error })
                    })
                })
            })
        });
    }

    test('TC-001 - credenciales correctas retornan el perfil del usuario', async () => {
        // Arrange
        mockSupabaseRespuesta(
            [{ id_usuario: 1, nombre: 'Demo', apellido: '', email: 'admin@sofom.mx', rol: { nombre_rol: 'Admin' }, contrasena: 'clave99' }],
            null
        );

        // Act
        const resultado = await modelLogin.ValidarCredenciales('admin@sofom.mx', 'clave99');

        // Assert
        expect(resultado).not.toBeNull();
        expect(resultado.correo).toBe('admin@sofom.mx');   // el modelo mapea email → correo
    });

    test('TC-002 - correo no encontrado en la BD retorna null', async () => {
        // Arrange
        mockSupabaseRespuesta([], null);   // tabla vacía = correo inexistente

        // Act
        const resultado = await modelLogin.ValidarCredenciales('noexiste@sofom.mx', 'demo123');

        // Assert
        expect(resultado).toBeNull();
    });

    test('TC-003 - contraseña incorrecta retorna null', async () => {
        // Arrange
        mockSupabaseRespuesta(
            [{ id_usuario: 2, email: 'admin@sofom.mx', contrasena: 'correcta' }],
            null
        );

        // Act
        const resultado = await modelLogin.ValidarCredenciales('admin@sofom.mx', 'incorrecta');

        // Assert
        expect(resultado).toBeNull();
    });

    test('TC-007 - Supabase rechaza la promesa → lanza Error con mensaje descriptivo', async () => {
        // Arrange - la promesa se rechaza (sin conexión), no solo devuelve un error object
        supabase.from.mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    limit: jest.fn().mockRejectedValue(new Error('connection timeout'))
                })
            })
        });

        // Act + Assert
        await expect(
            modelLogin.ValidarCredenciales('x@x.com', '123')
        ).rejects.toThrow('Error al conectar con la base de datos');
    });

});

// 4 - Controlador: ProcesarLogin (req/res mockeados)
describe('ProcesarLogin - controlador', () => {

    function mockReqRes(correo, password) {
        const req = { body: { correo, password } };
        const res = { redirect: jest.fn() };
        return { req, res };
    }

    test('TC-001 - usuario demo redirige directamente a /dashboard', async () => {
        // Arrange
        const { req, res } = mockReqRes('demo@sofom.mx', 'demo123');

        // Act
        await loginCtrl.ProcesarLogin(req, res);

        // Assert
        expect(res.redirect).toHaveBeenCalledWith('/dashboard');
    });

    test('TC-002 - credenciales incorrectas redirigen a /login con mensaje de error', async () => {
        // Arrange — Supabase responde con lista vacía (correo no existe)
        supabase.from.mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue({ data: [], error: null })
                    })
                })
            })
        });
        const { req, res } = mockReqRes('noexiste@sofom.mx', 'demo123');

        // Act
        await loginCtrl.ProcesarLogin(req, res);

        // Assert
        expect(res.redirect).toHaveBeenCalledWith(
            expect.stringContaining('/login?mensaje=')
        );
    });

    test('TC-007 - error de BD redirige a /login con mensaje de fallo de conexión', async () => {
        // Arrange — Supabase lanza excepción
        supabase.from.mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        limit: jest.fn().mockRejectedValue(new Error('timeout'))
                    })
                })
            })
        });
        const { req, res } = mockReqRes('x@x.com', 'abc');

        // Act
        await loginCtrl.ProcesarLogin(req, res);

        // Assert
        expect(res.redirect).toHaveBeenCalledWith(
            expect.stringContaining('/login?mensaje=')
        );
    });

});
