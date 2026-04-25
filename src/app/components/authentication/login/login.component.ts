import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, LoginRequest } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  returnUrl: string = '';
  showPassword = false;
  activeTab = 'login';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });

    // Get return url from route parameters if present
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
  }

  get f() {
    return this.loginForm.controls;
  }

  setTab(tab: string): void {
    this.activeTab = tab;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';

    // Stop if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    const loginRequest: LoginRequest = {
      username: this.f['username'].value,
      password: this.f['password'].value
    };

    this.authService.login(loginRequest).subscribe(
      {
        next: (response: any) => {
          console.log('Login successful:', response);
          const role = (response.role || '').toString().toUpperCase();
          let targetRoute = '/dashboard';

          if (role === 'ADMIN' || role === 'ROLE_ADMIN') {
            targetRoute = '/admin/dashboard';
          } else if (role === 'AGENT' || role === 'ROLE_AGENT') {
            targetRoute = '/agent-dhasbord';
          } else if (role === 'OPERATOR' || role === 'ROLE_OPERATOR') {
            targetRoute = '/operator-dhasbord';
          } else if (role === 'PASSENGER' || role === 'ROLE_PASSENGER' || role === 'PASSANGER' || role === 'ROLE_PASSANGER') {
            targetRoute = '/passenger-dhasbord';
          }

          const redirectUrl = this.returnUrl && this.returnUrl !== '/login' && this.returnUrl !== '/' ? this.returnUrl : targetRoute;
          this.router.navigate([redirectUrl]);
        },
        error: (error: any) => {
          const errorMessage = this.extractErrorMessage(error);

          // Handle account deactivation/ban error
          const lowerMessage = errorMessage.toLowerCase();
          if (lowerMessage.includes('deactivated') || lowerMessage.includes('banned') || lowerMessage.includes('inactivated') || lowerMessage.includes('account is')) {
            this.error = this.formatBanMessage(errorMessage);
          } else {
            this.error = errorMessage;
          }

          console.error('Login error:', error);
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      }
    );
  }

  private formatBanMessage(message: string): string {
    // Extract date from messages like "Account is deactivated until 2026-04-26T14:53".
    const dateMatch = message.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:[+-]\d{2}:\d{2})?)/);

    if (dateMatch) {
      try {
        const banDate = new Date(dateMatch[1]);
        if (!isNaN(banDate.getTime())) {
          const formattedDate = banDate.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          return `This account is banned until ${formattedDate}.`;
        }
      } catch (e) {
        console.error('Error formatting ban date:', e);
      }
    }

    if (message.toLowerCase().includes('banned') || message.toLowerCase().includes('deactivated') || message.toLowerCase().includes('inactivated')) {
      return 'This account is banned.';
    }

    return message || 'Login failed. Please check your credentials.';
  }

  private extractErrorMessage(error: any): string {
    if (!error) {
      return 'Login failed. Please check your credentials.';
    }

    const backendCandidates: string[] = [];
    const fallbackCandidates: string[] = [];

    if (typeof error === 'string') {
      fallbackCandidates.push(error);
    }

    if (error.error) {
      if (typeof error.error === 'string') {
        backendCandidates.push(error.error);
      }
      if (typeof error.error.message === 'string') {
        backendCandidates.push(error.error.message);
      }
      if (typeof error.error.error === 'string') {
        backendCandidates.push(error.error.error);
      }
      if (Array.isArray(error.error.errors)) {
        backendCandidates.push(...error.error.errors.filter((item: unknown): item is string => typeof item === 'string'));
      }
    }

    if (typeof error.message === 'string') {
      fallbackCandidates.push(error.message);
    }

    const sanitize = (value: string): string => value.trim();
    const isGenericAngularHttpMessage = (value: string): boolean =>
      /^Http failure response for .*: \d{3}/i.test(value);

    const preferred = backendCandidates
      .map(sanitize)
      .find(value => value && value !== '[object Object]');

    if (preferred) {
      return preferred;
    }

    const fallback = fallbackCandidates
      .map(sanitize)
      .find(value => value && value !== '[object Object]' && !isGenericAngularHttpMessage(value));

    return fallback || 'Login failed. Please check your credentials.';
  }
}
