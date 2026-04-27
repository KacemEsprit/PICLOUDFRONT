import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User, RoleEnum } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private router: Router) {}

  saveToken(token: string) { localStorage.setItem('token', token); }
  getToken(): string | null { return localStorage.getItem('token'); }
  saveUser(user: User) { localStorage.setItem('user', JSON.stringify(user)); }
  clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getUser(): User | null {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  }

  getUserId(): number | null {
    return this.getUser()?.id ?? null;
  }

  getRole(): RoleEnum | null {
    return this.getUser()?.role ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isOperator(): boolean { return this.getRole() === RoleEnum.OPERATOR; }
  isPassenger(): boolean { return this.getRole() === RoleEnum.PASSENGER; }
  isAdmin(): boolean { return this.getRole() === RoleEnum.ADMIN; }

  logout() {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  getInitials(): string {
    const u = this.getUser();
    if (!u) return 'U';
    return u.name ? u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : u.username.slice(0, 2).toUpperCase();
  }
}
