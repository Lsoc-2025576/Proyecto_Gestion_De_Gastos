import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { IncomeService } from '../../services/income.service';
import { Income } from '../../types/income.types';
import { calculateItemTax } from '../../utils/tax.utils';
import { IncomeModalComponent } from './income-modal.component';
import { AuthService } from '../../services/auth.service';
import { type User } from '../../types/auth.types';

@Component({
  selector: 'app-ingresos',
  standalone: true,
  imports: [CommonModule, RouterLink, IncomeModalComponent],
  templateUrl: './ingresos.html',
  styleUrls: ['./ingresos.css']
})
export class IngresosComponent implements OnInit {
  private incomeService = inject(IncomeService);
  private authService = inject(AuthService);
  private router = inject(Router);

  get user(): User | null {
    return this.authService.user();
  }

  incomes = signal<Income[]>([]);
  isModalOpen = signal(false);
  selectedIncomeForEdit = signal<Income | null>(null);

  // Separación por tipo
  fijos = computed(() => this.incomes().filter(i => i.type === 'FIJO'));
  variados = computed(() => this.incomes().filter(i => i.type === 'VARIADO'));

  totalFijo = computed(() => this.fijos().reduce((acc, i) => acc + Number(i.amount), 0));
  totalVariado = computed(() => this.variados().reduce((acc, i) => acc + Number(i.amount), 0));
  totalGeneral = computed(() => this.totalFijo() + this.totalVariado());

  porcentajeFijo = computed(() => {
    const total = this.totalGeneral();
    return total === 0 ? 0 : (this.totalFijo() / total) * 100;
  });

  porcentajeVariado = computed(() => {
    const total = this.totalGeneral();
    return total === 0 ? 0 : 100 - this.porcentajeFijo();
  });

  // Cálculos fiscales detallados por ítem
  calculatedItems = computed(() => {
    return this.incomes().map(inc => ({
      ...inc,
      tax: calculateItemTax(inc)
    }));
  });

  fijosCalculated = computed(() => this.calculatedItems().filter(i => i.type === 'FIJO'));
  variadosCalculated = computed(() => this.calculatedItems().filter(i => i.type === 'VARIADO'));

  totalIgss = computed(() => this.fijosCalculated().reduce((acc, i) => acc + i.tax.igssMensual, 0));
  totalIsrFijo = computed(() => this.fijosCalculated().reduce((acc, i) => acc + i.tax.isrMensual, 0));
  totalIsrVariado = computed(() => this.variadosCalculated().reduce((acc, i) => acc + i.tax.totalDeducciones, 0));

  netoFijo = computed(() => this.totalFijo() - this.fijosCalculated().reduce((acc, i) => acc + i.tax.totalDeducciones, 0));
  netoVariado = computed(() => this.totalVariado() - this.totalDeduccionesVariado());
  
  totalDeduccionesVariado = computed(() => this.variadosCalculated().reduce((acc, i) => acc + i.tax.totalDeducciones, 0));
  
  totalNetoGeneral = computed(() => this.netoFijo() + this.netoVariado());

  ngOnInit() {
    this.loadIncomes();
  }

  loadIncomes() {
    this.incomeService.getAll().subscribe({
      next: (res) => {
        if (res.data) {
          this.incomes.set(res.data.incomes);
        }
      },
      error: (err) => console.error('Error al cargar ingresos', err)
    });
  }

  openNewModal() {
    this.selectedIncomeForEdit.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(income: Income) {
    this.selectedIncomeForEdit.set(income);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedIncomeForEdit.set(null);
  }

  deleteIncome(id: number) {
    if (confirm('¿Estás seguro de eliminar este ingreso?')) {
      this.incomeService.delete(id).subscribe({
        next: () => this.loadIncomes(),
        error: (err) => console.error('Error al eliminar', err)
      });
    }
  }

  onSaveSuccess() {
    this.closeModal();
    this.loadIncomes();
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.authService.clearUser();
        this.router.navigate(['/login']);
      }
    });
  }

  totalIvaCobrado = computed(() => 
  this.variadosCalculated().reduce((acc, i) => acc + (i.tax.ivaCobrado || 0), 0)
);

}