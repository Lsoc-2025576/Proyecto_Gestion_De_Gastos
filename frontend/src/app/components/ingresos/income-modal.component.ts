import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncomeService } from '../../services/income.service';
import { Income, IncomeClassification, IncomeRegime, IncomeType } from '../../types/income.types';

@Component({
  selector: 'app-income-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" (click)="onClose()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <h3>{{ incomeToEdit ? 'Editar Ingreso' : 'Nuevo Ingreso' }}</h3>
        
        <form (submit)="onSubmit($event)">
          <div class="form-group">
            <label>Nombre del Ingreso</label>
            <input type="text" [(ngModel)]="name" name="name" placeholder="Ej. Salario Base, Freelance" required />
          </div>

          <div class="form-group">
            <label>Monto (Q)</label>
            <input type="number" step="0.01" [(ngModel)]="amount" name="amount" placeholder="0.00" required />
          </div>

          <div class="form-group">
            <label>Tipo de Ingreso</label>
            <select [(ngModel)]="type" name="type" (change)="onTypeChange()">
              <option value="FIJO">Fijo</option>
              <option value="VARIADO">Variado</option>
            </select>
          </div>

          <div class="form-group">
            <label>Clasificación Fiscal</label>
            <select [(ngModel)]="classification" name="classification">
              @if (type === 'FIJO') {
                <option value="SUELDO">Sueldo (Relación de dependencia - ISR/IGSS)</option>
                <option value="CAPITAL">Capital (Alquileres / Rentas)</option>
              } @else {
                <option value="SERVICIO_FACTURADO">Servicio Facturado (Profesional / Freelance)</option>
                <option value="VENTA_ACTIVO">Venta Ocasional de Activo</option>
              }
            </select>
          </div>

          @if (classification === 'SERVICIO_FACTURADO') {
            <div class="form-group">
              <label>Régimen Fiscal</label>
              <select [(ngModel)]="regime" name="regime">
                <option value="PEQUENO_CONTRIBUYENTE">Pequeño Contribuyente (5% único)</option>
                <option value="OPCIONAL_SIMPLIFICADO">Régimen Opcional Simplificado (ISR + IVA)</option>
              </select>
            </div>
          }

          <div class="form-group">
            <label>Descripción (Opcional)</label>
            <textarea [(ngModel)]="description" name="description" placeholder="Detalles adicionales..."></textarea>
          </div>

          @if (errorMessage()) {
            <div class="error-msg">{{ errorMessage() }}</div>
          }

          <div class="modal-actions">
            @if (incomeToEdit) {
              <button type="button" class="btn-delete" (click)="onDelete()">Eliminar</button>
            }
            <button type="button" class="btn-cancel" (click)="onClose()">Cancelar</button>
            <button type="submit" class="btn-save">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; z-index: 1000;
    }
    .modal-card {
      background: #FFFFFF; padding: 28px; border-radius: 16px; width: 420px; max-width: 90%;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2); color: #131B2E;
    }
    h3 { margin-top: 0; margin-bottom: 20px; font-size: 20px; text-align: center; }
    .form-group { margin-bottom: 16px; display: flex; flex-direction: column; }
    label { font-size: 13px; font-weight: 700; margin-bottom: 6px; color: #5B6478; }
    input, select, textarea {
      padding: 10px 12px; border: 1px solid #E4E7EE; border-radius: 8px; font-size: 14px;
      font-family: inherit; width: 100%;
    }
    textarea { resize: vertical; height: 60px; }
    .error-msg { background: #FDE8E8; color: #C0533E; padding: 8px; border-radius: 6px; font-size: 13px; margin-bottom: 14px; text-align: center; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; }
    button { padding: 10px 18px; border-radius: 8px; font-weight: 700; font-size: 13.5px; cursor: pointer; border: none; }
    .btn-save { background: #1E7A46; color: #FFF; }
    .btn-save:hover { background: #155934; }
    .btn-cancel { background: #E4E7EE; color: #131B2E; }
    .btn-delete { background: #C0533E; color: #FFF; margin-right: auto; }
  `]
})
export class IncomeModalComponent {
  @Input() incomeToEdit: Income | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();

  private incomeService = inject(IncomeService);

  name = '';
  amount: number = 0;
  type: IncomeType = 'FIJO';
  classification: IncomeClassification = 'SUELDO';
  regime: IncomeRegime | null = null;
  description = '';

  errorMessage = signal<string>('');

  ngOnInit() {
    if (this.incomeToEdit) {
      this.name = this.incomeToEdit.name;
      this.amount = this.incomeToEdit.amount;
      this.type = this.incomeToEdit.type;
      this.classification = this.incomeToEdit.classification;
      this.regime = this.incomeToEdit.regime;
      this.description = this.incomeToEdit.description || '';
    }
  }

  onTypeChange() {
    if (this.type === 'FIJO') {
      this.classification = 'SUELDO';
      this.regime = null;
    } else {
      this.classification = 'SERVICIO_FACTURADO';
      this.regime = 'PEQUENO_CONTRIBUYENTE';
    }
  }

  onSubmit(event: Event) {
    event.preventDefault();
    if (!this.name.trim() || this.amount <= 0) {
      this.errorMessage.set('Por favor completa un nombre válido y un monto mayor a 0.');
      return;
    }

    const payload = {
      name: this.name,
      amount: Number(this.amount),
      type: this.type,
      classification: this.classification,
      regime: this.classification === 'SERVICIO_FACTURADO' ? this.regime : null,
      description: this.description || undefined
    };

    if (this.incomeToEdit) {
      this.incomeService.update(this.incomeToEdit.id, payload).subscribe({
        next: () => this.save.emit(),
        error: (err) => this.errorMessage.set(err.error?.message || 'Error al actualizar el ingreso')
      });
    } else {
      this.incomeService.create(payload).subscribe({
        next: () => this.save.emit(),
        error: (err) => this.errorMessage.set(err.error?.message || 'Error al crear el ingreso')
      });
    }
  }

  onDelete() {
    if (this.incomeToEdit && confirm('¿Deseas eliminar este ingreso?')) {
      this.incomeService.delete(this.incomeToEdit.id).subscribe({
        next: () => this.save.emit(),
        error: (err) => this.errorMessage.set(err.error?.message || 'Error al eliminar el ingreso')
      });
    }
  }

  onClose() {
    this.close.emit();
  }
}