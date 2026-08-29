import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { type User } from '../../types/auth.types';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  // FIX: Usamos el signal tipado del AuthService.
  // Antes: leiamos de localStorage (inseguro) y usabamos 'any'.
  // Ahora: los datos vienen del backend via cookie httpOnly y estan tipados.
  get user(): User | null {
    return this.authService.user();
  }

  ngOnInit() {
    // FIX: Ya no leemos localStorage.
    // El authGuard ya verifico que hay sesion antes de cargar este componente.
    // Los datos del usuario vienen del AuthService (que los obtuvo de /api/auth/me).
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
}
