export type IncomeType = 'FIJO' | 'VARIADO';
export type IncomeClassification = 'SUELDO' | 'CAPITAL' | 'SERVICIO_FACTURADO' | 'VENTA_ACTIVO';
export type IncomeRegime = 'PEQUENO_CONTRIBUYENTE' | 'OPCIONAL_SIMPLIFICADO';

export interface Income {
  id: number;
  name: string;
  amount: number;
  type: IncomeType;
  classification: IncomeClassification;
  regime: IncomeRegime | null;
  date: string;
  description: string | null;
  createdAt: string;
}

export interface IncomeFormData {
  name: string;
  amount: number;
  type: IncomeType;
  classification: IncomeClassification;
  regime?: IncomeRegime | null;
  date?: string;
  description?: string;
}

export interface IncomeSummary {
  total: number;
  fijo: number;
  variado: number;
}