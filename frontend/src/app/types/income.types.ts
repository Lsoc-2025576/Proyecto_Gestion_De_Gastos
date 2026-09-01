export type IncomeType = 'FIJO' | 'VARIADO';

export interface Income {
  id: number;
  name: string;
  amount: number;
  type: IncomeType;
  date: string;
  description: string | null;
  createdAt: string;
}

export interface IncomeFormData {
  name: string;
  amount: number;
  type: IncomeType;
  date: string;
  description?: string;
}

export interface IncomeSummary {
  total: number;
  fijo: number;
  variado: number;
}