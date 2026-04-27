import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { RoleEnum } from '../../core/models/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="login-page">
  <div class="login-card">
    <div class="login-header">
      <div class="login-logo"><i class="fas fa-bus-alt"></i></div>
      <div class="login-title">TransitTN</div>
      <div class="login-subtitle">Sign in to your account</div>
    </div>
    <div class="login-body">
      <div class="alert alert-danger" *ngIf="error">
        <i class="fas fa-times-circle"></i> {{ error }}
      </div>
      <div class="form-group mb-4">
        <label class="form-label">Username <span class="required">*</span></label>
        <input type="text" class="form-control" [(ngModel)]="username"
               placeholder="Enter your username"
               [class.error]="submitted && !username"/>
      </div>
      <div class="form-group mb-6">
        <label class="form-label">Password <span class="required">*</span></label>
        <input type="password" class="form-control" [(ngModel)]="password"
               placeholder="••••••••"
               (keyup.enter)="login()"
               [class.error]="submitted && !password"/>
      </div>
      <button class="btn btn-primary" style="width:100%;justify-content:center"
              (click)="login()" [disabled]="loading">
        <i class="fas fa-spinner fa-spin" *ngIf="loading"></i>
        <i class="fas fa-sign-in-alt" *ngIf="!loading"></i>
        {{ loading ? 'Signing in...' : 'Sign in' }}
      </button>
    </div>
  </div>
</div>
  `
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  loading = false;
  submitted = false;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private notif: NotificationService
  ) {}

  login() {
    this.submitted = true;
    if (!this.username || !this.password) return;
    this.auth.clearSession();
    this.loading = true;
    this.error = '';

    this.api.login({ username: this.username, password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        this.auth.saveToken(res.token);
        if (res.user) {
          this.auth.saveUser(res.user);
          this.notif.success(`Welcome, ${res.user.name || res.user.username}!`);
          this.redirect(res.user.role);
        }
      },
      error: (err) => {
        const msg =
          err.error?.message ||
          err.error?.error ||
          (typeof err.error === 'string' ? err.error : null);
        this.error =
          msg && String(msg).trim()
            ? String(msg)
            : 'Invalid credentials or account unavailable. Please try again.';
        this.loading = false;
      }
    });
  }

  private redirect(role: RoleEnum) {
    if (role === RoleEnum.OPERATOR || role === RoleEnum.ADMIN) {
      this.router.navigate(['/operator/dashboard']);
    } else {
      this.router.navigate(['/passenger/plans']);
    }
  }
}