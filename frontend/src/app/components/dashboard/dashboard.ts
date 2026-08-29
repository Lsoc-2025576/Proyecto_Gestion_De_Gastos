import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { type User } from '../../types/auth.types';

interface Movimiento {
  icono: string;
  nombre: string;
  categoria: string;
  fecha: string;
  monto: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  // FIX: Usamos el signal del AuthService en vez de una variable 'any'.
  // El signal es reactivo: si el usuario cambia (logout), la vista se actualiza sola.
  // Ademas esta tipado: sabemos que tiene id, name, email, role.
  get user(): User | null {
    return this.authService.user();
  }

  // Datos de ejemplo — luego vendran del backend
  saldoTotal = 10850;
  gastosTotales = 4580;
  ahorrosTotales = 6310;

  movimientos: Movimiento[] = [
    { icono: '🏠', nombre: 'Arriendo', categoria: 'Vivienda', fecha: '01/08', monto: 850.00 },
    { icono: '🛒', nombre: 'Supermercado', categoria: 'Alimentacion', fecha: '02/08', monto: -190.50 },
    { icono: '💼', nombre: 'Salario - Extra', categoria: 'Ingresos', fecha: '03/08', monto: 3220.00 },
    { icono: '⛽', nombre: 'Gasolina', categoria: 'Transporte', fecha: '04/08', monto: -55.99 },
    { icono: '⛽', nombre: 'Gasolina', categoria: 'Deuda', fecha: '05/08', monto: -55.99 },
  ];

  ngOnInit() {
    // FIX: Ya no verificamos manualmente la sesion aqui.
    // El authGuard se encarga de eso ANTES de cargar este componente.
    // Si llegamos aqui, es porque el usuario esta autenticado.
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        // Incluso si el backend falla, limpiamos local y redirigimos
        this.authService.clearUser();
        this.router.navigate(['/login']);
      }
    });
  }
}
