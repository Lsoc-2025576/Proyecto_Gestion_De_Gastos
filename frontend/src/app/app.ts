import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // <-- ¡Esta línea es clave para que funcionen las rutas!
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}