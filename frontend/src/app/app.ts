import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private authService = inject(AuthService);

  ngOnInit() {
    // Al arrancar la app, verificamos si hay una sesion activa.
    // Esto evita que el usuario tenga que loguearse de nuevo al refrescar la pagina.
    this.authService.checkSession().subscribe();
  }
}
