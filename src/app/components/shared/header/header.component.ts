import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../services/auth/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  title = 'Transit TN';
  currentUser$!: Observable<User | null>;
  isAuthenticated$!: Observable<boolean>;
  currentRoute: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.router.events.subscribe(() => {
      this.currentRoute = this.router.url;
    });
  }

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.currentRoute = this.router.url;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isLoginPage(): boolean {
    return this.currentRoute.includes('/login');
  }

  isRegisterPage(): boolean {
    return this.currentRoute.includes('/register');
  }

  isHomePage(): boolean {
    return this.currentRoute === '/' || this.currentRoute.includes('/home');
  }

  isDashboardPage(): boolean {
    return this.currentRoute.includes('-dhasbord') ||
           this.currentRoute.includes('/admin/users') ||
           this.currentRoute.includes('-dhasbord/users');
  }

  isProfilePage(): boolean {
    return this.currentRoute.includes('/profile');
  }

  isDocumentsPage(): boolean {
    return this.currentRoute.includes('/documents');
  }

  getDashboardLink(): string {
    const user = this.currentUser;
    if (!user) return '/home';

    const role = user.role.toUpperCase();
    switch (role) {
      case 'ADMIN':
        return '/admin-dhasbord';
      case 'AGENT':
        return '/agent-dhasbord';
      case 'OPERATOR':
        return '/operator-dhasbord';
      case 'PASSENGER':
        return '/passenger-dhasbord';
      default:
        return '/home';
    }
  }

  get currentUser(): User | null {
    return this.authService.currentUserValue;
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated;
  }
}

