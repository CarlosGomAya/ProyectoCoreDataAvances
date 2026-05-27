// Funciones puras de lógica de alertas PLD — extraídas para permitir testing aislado

/**
 * Normaliza el estatus de la BD al valor que muestra la UI.
 * @param {string} dbEstatus - Valor crudo de la columna estatus
 * @returns {'Pendiente' | 'En revision' | 'Resuelta'}
 */
function normalizarEstatus(dbEstatus) {
    const v = (dbEstatus || '').toUpperCase().trim();
    if (v === 'ABIERTA'     || v === 'PENDIENTE')                        return 'Pendiente';
    if (v === 'EN_REVISION' || v === 'EN REVISION' || v === 'REVISION') return 'En revision';
    if (v === 'CERRADA'     || v === 'RESUELTA'    || v === 'CLOSED')   return 'Resuelta';
    return 'Pendiente';
}

/**
 * Determina el nivel de riesgo de una alerta según su tipo.
 * @param {string} tipoAlerta
 * @returns {'Alto' | 'Medio' | 'Bajo'}
 */
function calcularNivelAlerta(tipoAlerta) {
    const tipo = (tipoAlerta || '').toLowerCase();
    if (tipo.includes('relevante')) return 'Alto';
    if (tipo.includes('inusual'))   return 'Medio';
    return 'Bajo';
}

module.exports = { normalizarEstatus, calcularNivelAlerta };
