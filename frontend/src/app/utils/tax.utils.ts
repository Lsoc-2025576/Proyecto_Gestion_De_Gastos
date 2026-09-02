export const TAX_CONSTANTS = {
  DEDUCCION_UNICA_ANUAL: 48000,
  TASA_IGSS_TRABAJADOR: 0.0483,
  TASA_ISR_TRAMO_1: 0.05,
  TASA_ISR_TRAMO_2: 0.07,
  LIMITE_TRAMO_ISR_ANUAL: 300000,
  MONTO_FIJO_TRAMO_2: 15000,
  TASA_PEQUENO_CONTRIBUYENTE: 0.05,
  TASA_IVA: 0.12,
  LIMITE_MENSUAL_ISR_SIMPLIFICADO: 30000,
  LIMITE_ANUAL_PEQUENO_CONTRIBUYENTE: 500285
};

export interface TaxCalculationResult {
  igssMensual: number;
  isrMensual: number;
  ivaCobrado: number;
  totalDeducciones: number;
  neto: number;
  labelImpuesto: string;
  etiquetaTag: 'tag-igss' | 'tag-isr' | 'tag-iva' | 'ninguno';
  avisoLimite?: string;
}

/**
 * Calcula los impuestos de forma INDIVIDUAL por cada ítem según su clasificación y régimen.
 */
export function calculateItemTax(income: {
  amount: number;
  classification: string;
  regime?: string | null;
}): TaxCalculationResult {
  const amount = Number(income.amount) || 0;
  let igssMensual = 0;
  let isrMensual = 0;
  let ivaCobrado = 0;
  let totalDeducciones = 0;
  let labelImpuesto = '';
  let etiquetaTag: 'tag-igss' | 'tag-isr' | 'tag-iva' | 'ninguno' = 'ninguno';
  let avisoLimite: string | undefined = undefined;

  if (income.classification === 'SUELDO') {
    igssMensual = amount * TAX_CONSTANTS.TASA_IGSS_TRABAJADOR;
    const sueldoAnual = amount * 12;
    const igssAnual = igssMensual * 12;
    const rentaImponibleAnual = Math.max(0, sueldoAnual - igssAnual - TAX_CONSTANTS.DEDUCCION_UNICA_ANUAL);
    
    let isrAnual = 0;
    if (rentaImponibleAnual <= TAX_CONSTANTS.LIMITE_TRAMO_ISR_ANUAL) {
      isrAnual = rentaImponibleAnual * TAX_CONSTANTS.TASA_ISR_TRAMO_1;
    } else {
      isrAnual = TAX_CONSTANTS.MONTO_FIJO_TRAMO_2 + (rentaImponibleAnual - TAX_CONSTANTS.LIMITE_TRAMO_ISR_ANUAL) * TAX_CONSTANTS.TASA_ISR_TRAMO_2;
    }
    isrMensual = isrAnual / 12;
    totalDeducciones = igssMensual + isrMensual;
    labelImpuesto = 'IGSS 4.83% + ISR Trabajos';
    etiquetaTag = 'tag-igss';
  } else if (income.classification === 'CAPITAL' || income.classification === 'VENTA_ACTIVO') {
    totalDeducciones = 0;
    labelImpuesto = 'Sin cálculo automático';
    etiquetaTag = 'ninguno';
  } else if (income.classification === 'SERVICIO_FACTURADO') {
    if (income.regime === 'PEQUENO_CONTRIBUYENTE') {
      const tasaUnica = amount * TAX_CONSTANTS.TASA_PEQUENO_CONTRIBUYENTE;
      totalDeducciones = tasaUnica;
      labelImpuesto = 'IVA+ISR 5% (Pequeño Contribuyente)';
      etiquetaTag = 'tag-iva';

      if (amount * 12 > TAX_CONSTANTS.LIMITE_ANUAL_PEQUENO_CONTRIBUYENTE) {
        avisoLimite = 'Este monto podría superar el límite del régimen de Pequeño Contribuyente — verifica si corresponde cambiar a Régimen General.';
      }
    } else if (income.regime === 'OPCIONAL_SIMPLIFICADO') {
      ivaCobrado = amount * TAX_CONSTANTS.TASA_IVA;
      let isr = 0;
      if (amount <= TAX_CONSTANTS.LIMITE_MENSUAL_ISR_SIMPLIFICADO) {
        isr = amount * TAX_CONSTANTS.TASA_ISR_TRAMO_1;
      } else {
        isr = (TAX_CONSTANTS.LIMITE_MENSUAL_ISR_SIMPLIFICADO * TAX_CONSTANTS.TASA_ISR_TRAMO_1) + ((amount - TAX_CONSTANTS.LIMITE_MENSUAL_ISR_SIMPLIFICADO) * TAX_CONSTANTS.TASA_ISR_TRAMO_2);
      }
      totalDeducciones = isr;
      labelImpuesto = 'ISR Opcional Simplificado';
      etiquetaTag = 'tag-isr';
    }
  }

  const neto = amount - totalDeducciones;

  return {
    igssMensual,
    isrMensual,
    ivaCobrado,
    totalDeducciones,
    neto,
    labelImpuesto,
    etiquetaTag,
    avisoLimite
  };
}