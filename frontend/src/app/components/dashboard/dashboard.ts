import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

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
  user: any = {};

  // Datos de ejemplo — luego vendrán del backend
  saldoTotal = 10850;
  gastosTotales = 4580;
  ahorrosTotales = 6310;

  movimientos: Movimiento[] = [
    { icono: '🏠', nombre: 'Arriendo', categoria: 'Vivienda', fecha: '01/08', monto: 850.00 },
    { icono: '🛒', nombre: 'Supermercado', categoria: 'Alimentación', fecha: '02/08', monto: -190.50 },
    { icono: '💼', nombre: 'Salario - Extra', categoria: 'Ingresos', fecha: '03/08', monto: 3220.00 },
    { icono: '⛽', nombre: 'Gasolina', categoria: 'Transporte', fecha: '04/08', monto: -55.99 },
    { icono: '⛽', nombre: 'Gasolina', categoria: 'Deuda', fecha: '05/08', monto: -55.99 },
  ];

  constructor(private router: Router) {}

  async ngOnInit() {
    try {
      const response = await fetch('http://localhost:3000/api/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        this.user = data.user;
      } else {
        this.router.navigate(['/login']);
      }
    } catch {
      this.router.navigate(['/login']);
    }
  }

  async logout() {
    await fetch('http://localhost:3000/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    this.router.navigate(['/login']);
  }
}