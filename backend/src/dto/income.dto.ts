export type IncomeType = 'FIJO' | 'VARIADO';

export interface CreateIncomeDto {
  name: string;
  amount: number;
  type: IncomeType;
  date?: string;
  description?: string;
}

export interface UpdateIncomeDto {
  name?: string;
  amount?: number;
  type?: IncomeType;
  date?: string;
  description?: string;
}