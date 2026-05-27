// Funciones puras de lógica de cliente — extraídas del wizard EJS para permitir testing aislado

/**
 * Calcula el nivel de riesgo PLD del cliente.
 * Reglas (en orden de prioridad):
 *   1. PEP  → siempre Alto
 *   2. Límite operativo >= 1,500,000 MXN → Medio
 *   3. El resto → Bajo
 *
 * @param {boolean} esPEP
 * @param {number}  limiteOperativo
 * @returns {'Alto' | 'Medio' | 'Bajo'}
 */
function calcularNivelRiesgo(esPEP, limiteOperativo) {
    if (esPEP) return 'Alto';
    if (limiteOperativo >= 1500000) return 'Medio';
    return 'Bajo';
}

/**
 * Valida los campos obligatorios del Paso 1 del wizard de registro de cliente.
 * @param {string} nombre
 * @param {string} rfc
 * @returns {{ valido: boolean, mensaje: string }}
 */
function validarCamposPaso1(nombre, rfc) {
    const nombreOk = typeof nombre === 'string' && nombre.trim().length > 0;
    const rfcOk    = typeof rfc    === 'string' && rfc.trim().length    > 0;

    if (!nombreOk || !rfcOk) {
        return { valido: false, mensaje: 'Nombre y RFC son obligatorios para continuar.' };
    }
    return { valido: true, mensaje: '' };
}

module.exports = { calcularNivelRiesgo, validarCamposPaso1 };
