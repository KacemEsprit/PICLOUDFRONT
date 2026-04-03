import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, LoginRequest } from '../../services/auth.service';

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
            targetRoute = '/admin-dhasbord';
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
          this.error = error.error?.message || 'Login failed. Please check your credentials.';
          console.error('Login error:', error);
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      }
    );
  }
}
