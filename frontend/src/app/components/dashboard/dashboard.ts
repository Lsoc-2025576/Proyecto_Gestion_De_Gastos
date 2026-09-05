import { Component, OnInit, OnDestroy, inject } from '@angular/core';
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
export class DashboardComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);

  get user(): User | null {
    return this.authService.user();
  }

  saldoTotal = 10850;
  gastosTotales = 4580;
  ahorrosTotales = 6310;


  isLoggingOut = false;
  logoutMessage = 'Cerrando sesión, por favor espere...';

  movimientos: Movimiento[] = [
    { icono: '🏠', nombre: 'Arriendo', categoria: 'Vivienda', fecha: '01/08', monto: 850.00 },
    { icono: '🛒', nombre: 'Supermercado', categoria: 'Alimentacion', fecha: '02/08', monto: -190.50 },
    { icono: '💼', nombre: 'Salario - Extra', categoria: 'Ingresos', fecha: '03/08', monto: 3220.00 },
    { icono: '⛽', nombre: 'Gasolina', categoria: 'Transporte', fecha: '04/08', monto: -55.99 },
    { icono: '⛽', nombre: 'Gasolina', categoria: 'Deuda', fecha: '05/08', monto: -55.99 },
  ];

  // Control de inactividad
  private inactivityTimeout: any;
  private readonly IDLE_TIME_LIMIT = 3600000;
  private boundResetTimer = this.resetInactivityTimer.bind(this);

  // Control de expiración absoluta por el .env
  private envTokenInterval: any;

  ngOnInit() {
    this.initInactivityListener();
    this.initEnvTokenExpirationChecker();
  }

  ngOnDestroy() {
    this.clearInactivityListener();
    if (this.envTokenInterval) {
      clearInterval(this.envTokenInterval);
    }
  }

  private initEnvTokenExpirationChecker() {
    this.envTokenInterval = setInterval(() => {
      const expirationTimeStr = localStorage.getItem('tokenExpirationTime');
      if (expirationTimeStr) {
        const expirationTime = parseInt(expirationTimeStr, 10);
        const currentTime = new Date().getTime();

        if (currentTime >= expirationTime) {
          clearInterval(this.envTokenInterval);
          this.authService.clearUser();
          this.router.navigate(['/login'], { 
            queryParams: { reason: 'expired' } 
          });
        }
      }
    }, 1000);
  }

  private initInactivityListener() {
    window.addEventListener('mousemove', this.boundResetTimer);
    window.addEventListener('keydown', this.boundResetTimer);
    window.addEventListener('click', this.boundResetTimer);
    window.addEventListener('scroll', this.boundResetTimer);

    this.resetInactivityTimer();
  }

  private clearInactivityListener() {
    window.removeEventListener('mousemove', this.boundResetTimer);
    window.removeEventListener('keydown', this.boundResetTimer);
    window.removeEventListener('click', this.boundResetTimer);
    window.removeEventListener('scroll', this.boundResetTimer);

    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
    }
  }

  private resetInactivityTimer() {
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
    }

    this.inactivityTimeout = setTimeout(() => {
      this.handleSessionTimeout();
    }, this.IDLE_TIME_LIMIT);
  }

  private handleSessionTimeout() {
    this.authService.clearUser();
    this.router.navigate(['/login'], { 
      queryParams: { reason: 'inactivity' } 
    });
  }

  logout() {
    if (this.isLoggingOut) return; // Evita múltiples clics
    
    this.isLoggingOut = true;
    this.logoutMessage = 'Cerrando sesión de forma segura...';

    setTimeout(() => {
      this.authService.logout().subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: () => {
          this.authService.clearUser();
          this.router.navigate(['/login']);
        }
      });
    }, 1200);
  }

  // Estado para el modal de soporte
  isSupportOpen = false;

  toggleSupportModal() {
    this.isSupportOpen = !this.isSupportOpen;
  }

  // Estado para el modal de perfil de usuario
  isProfileOpen = false;

  toggleProfileModal() {
    this.isProfileOpen = !this.isProfileOpen;
  }
}