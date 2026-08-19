import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email = '';
  password = '';
  sessionExpiredMessage = signal(false);

  constructor(private router: Router) {}

  async onLogin(event: Event) {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: this.email, password: this.password })
      });

      const data = await response.json();

      if (response.ok) {
        this.router.navigate(['/dashboard']);

        setTimeout(async () => {
          await fetch('http://localhost:3000/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
          });
          this.router.navigate(['/login']);
          this.sessionExpiredMessage.set(true);

          // La notificación se oculta sola después de 4 segundos
          setTimeout(() => this.sessionExpiredMessage.set(false), 4000);
        }, 60 * 1000);
      } else {
        alert(data.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error de red:', error);
      alert('No se pudo conectar con el servidor backend.');
    }
  }
}