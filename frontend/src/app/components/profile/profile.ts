import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  user: any = {};
  token: string | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    this.token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!this.token || !storedUser) {
      this.router.navigate(['/login']);
    } else {
      this.user = JSON.parse(storedUser);
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}