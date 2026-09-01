import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { type Income, type IncomeSummary, type IncomeFormData } from '../types/income.types';
import { type ApiResponse } from '../types/auth.types';

@Injectable({
  providedIn: 'root'
})
export class IncomeService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/incomes';

  getAll(): Observable<ApiResponse<{ incomes: Income[] }>> {
    return this.http.get<ApiResponse<{ incomes: Income[] }>>(this.apiUrl, { withCredentials: true });
  }

  getSummary(): Observable<ApiResponse<{ summary: IncomeSummary }>> {
    return this.http.get<ApiResponse<{ summary: IncomeSummary }>>(`${this.apiUrl}/summary`, { withCredentials: true });
  }

  create(data: IncomeFormData): Observable<ApiResponse<{ income: Income }>> {
    return this.http.post<ApiResponse<{ income: Income }>>(this.apiUrl, data, { withCredentials: true });
  }

  update(id: number, data: Partial<IncomeFormData>): Observable<ApiResponse<{ income: Income }>> {
    return this.http.patch<ApiResponse<{ income: Income }>>(`${this.apiUrl}/${id}`, data, { withCredentials: true });
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}
