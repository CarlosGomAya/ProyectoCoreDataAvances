// Funciones puras de lógica de operaciones — extraídas para permitir testing aislado

/**
 * Valida que los cuatro campos obligatorios de una operación estén presentes.
 * @param {{ idcliente, tipooperacion, monto, fecha }} datos
 * @returns {{ valido: boolean, mensaje: string }}
 */
function validarCamposOperacion(datos) {
    const { idcliente, tipooperacion, monto, fecha } = datos || {};
    if (!idcliente || !tipooperacion || !monto || !fecha) {
        return {
            valido:  false,
            mensaje: 'Faltan campos obligatorios: cliente, tipo, monto y fecha.'
        };
    }
    return { valido: true, mensaje: '' };
}

module.exports = { validarCamposOperacion };
