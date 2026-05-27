module.exports = {
    testMatch: ['**/tests/**/*.test.js'],
    collectCoverageFrom: [
        'src/**/*.js',
        'models/login.model.js',
        'models/clientes.model.js',
        'controllers/login.controller.js'
    ],
    coverageReporters: ['text', 'lcov'],
    forceExit: true
};
