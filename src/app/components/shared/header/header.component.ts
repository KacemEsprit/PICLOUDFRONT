import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../services/auth/auth.service';
import { Observable } from 'rxjs';
import { IncidentNotificationService } from '../../../services/incident-notification/incident-notification.service';
import { AppNotification } from '../../../models/incident-notification.model';

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
  unreadNotifications$!: Observable<number>;
  latestNotifications$!: Observable<AppNotification[]>;
  isNotificationOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private incidentNotificationService: IncidentNotificationService
  ) {
    this.router.events.subscribe(() => {
      this.currentRoute = this.router.url;
    });
  }

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.unreadNotifications$ = this.incidentNotificationService.unreadCount$;
    this.latestNotifications$ = this.incidentNotificationService.notifications$;
    this.currentRoute = this.router.url;
    if (this.isAuthenticated) {
      this.incidentNotificationService.refreshNotifications();
    }
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

  isNotificationsPage(): boolean {
    return this.currentRoute.includes('/notifications');
  }

  isIncidentsPage(): boolean {
    return this.currentRoute.includes('/incidents');
  }

  isAgent(): boolean {
    return this.currentUser?.role?.toUpperCase() === 'AGENT';
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

  toggleNotifications(): void {
    this.isNotificationOpen = !this.isNotificationOpen;
    if (this.isNotificationOpen) {
      this.incidentNotificationService.refreshNotifications();
    }
  }

  openNotificationsPage(): void {
    this.isNotificationOpen = false;
    this.router.navigate(['/notifications']);
  }

  markAsRead(notificationId: number): void {
    this.incidentNotificationService.markNotificationAsRead(notificationId).subscribe();
  }
}

