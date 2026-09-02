export type IncomeType = 'FIJO' | 'VARIADO';
export type IncomeClassification = 'SUELDO' | 'CAPITAL' | 'SERVICIO_FACTURADO' | 'VENTA_ACTIVO';
export type IncomeRegime = 'PEQUENO_CONTRIBUYENTE' | 'OPCIONAL_SIMPLIFICADO';

export interface CreateIncomeDto {
  name: string;
  amount: number;
  type: IncomeType;
  classification: IncomeClassification;
  regime?: IncomeRegime | null;
  date?: string;
  description?: string;
}

export interface UpdateIncomeDto {
  name?: string;
  amount?: number;
  type?: IncomeType;
  classification?: IncomeClassification;
  regime?: IncomeRegime | null;
  date?: string;
  description?: string;
}