import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService, User } from '../../services/auth.service';
import { Observable } from 'rxjs';

/**
 * EXAMPLE COMPONENT: Shows how to use AuthService in your components
 *
 * Features demonstrated:
 * 1. Getting current user from AuthService
 * 2. Checking authentication status
 * 3. Calling protected backend APIs
 * 4. Showing/hiding content based on auth state
 * 5. Unsubscribing pattern (using async pipe)
 */

@Component({
  selector: 'app-dashboard-example',
  template: `
    <div class="dashboard-container">
      <!-- Welcome User Section -->
      <div class="welcome-section" *ngIf="currentUser$ | async as user">
        <h1>Welcome, {{ user.name }}!</h1>
        <p>Email: {{ user.email }}</p>
        <p>Role: {{ user.role }}</p>
        <p>User ID: {{ user.id }}</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="(currentUser$ | async) === null && (isAuthenticated$ | async)">
        <p>Loading user data...</p>
      </div>

      <!-- Example API Data Section -->
      <div class="api-section">
        <h2>Data from Backend</h2>
        <button (click)="loadData()">Load Data</button>

        <div *ngIf="apiData$ | async as data">
          <pre>{{ data | json }}</pre>
        </div>

        <div *ngIf="loading">
          Loading...
        </div>

        <div *ngIf="error" class="error-message">
          Error: {{ error }}
        </div>
      </div>

      <!-- Auth Status Display -->
      <div class="auth-status">
        <p>
          Authentication Status:
          <strong *ngIf="isAuthenticated$ | async">✓ AUTHENTICATED</strong>
          <strong *ngIf="!(isAuthenticated$ | async)">✗ NOT AUTHENTICATED</strong>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .welcome-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 10px;
      margin-bottom: 2rem;
    }

    .welcome-section h1 {
      margin: 0 0 1rem 0;
      font-size: 2rem;
    }

    .welcome-section p {
      margin: 0.5rem 0;
      font-size: 1rem;
    }

    .api-section {
      background: #f5f5f5;
      padding: 2rem;
      border-radius: 10px;
      margin-bottom: 2rem;
    }

    .api-section h2 {
      margin-top: 0;
    }

    button {
      background-color: #667eea;
      color: white;
      border: none;
      padding: 0.7rem 1.5rem;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 600;
      margin-bottom: 1rem;
    }

    button:hover {
      background-color: #5568d3;
    }

    pre {
      background: white;
      padding: 1rem;
      border-radius: 5px;
      overflow-x: auto;
      border: 1px solid #ddd;
    }

    .error-message {
      background-color: #f8d7da;
      color: #721c24;
      padding: 1rem;
      border-radius: 5px;
      border: 1px solid #f5c6cb;
    }

    .auth-status {
      background: white;
      padding: 1rem;
      border-radius: 5px;
      border-left: 4px solid #667eea;
    }

    .auth-status strong {
      color: #667eea;
    }
  `]
})
export class DashboardExampleComponent implements OnInit {
  // Observable streams for use in template
  currentUser$!: Observable<User | null>;
  isAuthenticated$!: Observable<boolean>;
  apiData$?: Observable<any>;

  // Component state
  loading = false;
  error = '';

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Subscribe to auth service observables
    this.currentUser$ = this.authService.currentUser$;
    this.isAuthenticated$ = this.authService.isAuthenticated$;

    // Example: Get current user synchronously
    const user = this.authService.currentUserValue;
    console.log('Current user:', user);

    // Example: Check if logged in
    const isLoggedIn = this.authService.isLoggedIn();
    console.log('Is logged in:', isLoggedIn);
  }

  /**
   * Example of calling a protected backend API
   * The JwtInterceptor automatically adds the Authorization header
   */
  loadData(): void {
    this.loading = true;
    this.error = '';

    // Replace with your actual backend endpoint
    const apiUrl = 'http://localhost:8081/api/your-protected-endpoint';

    this.apiData$ = this.http.get(apiUrl);

    this.http.get(apiUrl).subscribe(
      {
        next: (data) => {
          console.log('Data loaded successfully:', data);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading data:', error);
          this.error = error.error?.message || 'Failed to load data';
          this.loading = false;
        }
      }
    );
  }

  /**
   * Example logout
   */
  logout(): void {
    this.authService.logout();
    console.log('User logged out');
    // Router would redirect to /login automatically
  }
}

/**
 * USAGE NOTES:
 *
 * 1. Import this component in app.module.ts
 * 2. Add route in app-routing.module.ts:
 *    { path: 'dashboard', component: DashboardExampleComponent, canActivate: [AuthGuard] }
 * 3. Access at: http://localhost:4200/dashboard
 *
 * KEY PATTERNS:
 *
 * Pattern 1: Using Observables (Recommended)
 * ────────────────────────────────────────
 * currentUser$ = this.authService.currentUser$;
 *
 * In template:
 * <p>{{ (currentUser$ | async)?.name }}</p>
 *
 * Benefits:
 * - Auto-unsubscribes with async pipe
 * - No memory leaks
 * - Reactive/declarative
 *
 *
 * Pattern 2: Subscribing in Component (Less Recommended)
 * ───────────────────────────────────────────────────
 * currentUser: User | null = null;
 *
 * ngOnInit() {
 *   this.authService.currentUser$.subscribe(user => {
 *     this.currentUser = user;
 *   });
 * }
 *
 * Must unsubscribe to prevent memory leaks:
 * ngOnDestroy() {
 *   this.subscription.unsubscribe();
 * }
 *
 *
 * Pattern 3: Getting Values Synchronously
 * ────────────────────────────────────────
 * const user = this.authService.currentUserValue;
 * const isLoggedIn = this.authService.isLoggedIn();
 *
 * Use for:
 * - Logic checks
 * - Navigation decisions
 * - Don't use in template (use observables instead)
 *
 *
 * CALLING PROTECTED APIS:
 * ──────────────────────
 * No special headers needed! JwtInterceptor handles it:
 *
 * this.http.get('http://localhost:8081/api/endpoint')
 *   .subscribe(data => console.log(data));
 *
 * The interceptor automatically adds:
 * Authorization: Bearer {jwt_token}
 *
 */
