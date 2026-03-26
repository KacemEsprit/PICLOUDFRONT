import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, RegisterRequest } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  success = '';

  // Role options that match backend RoleEnum
  roles = ['ADMIN', 'AGENT', 'OPERATOR', 'PASSENGER'];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required]],
      CIN: ['', [Validators.required]],
      role: ['AGENT', [Validators.required]],
      photo: ['']
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';

    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;

    const registerRequest: RegisterRequest = {
      username: this.f['username'].value,
      password: this.f['password'].value,
      email: this.f['email'].value,
      name: this.f['name'].value,
      CIN: this.f['CIN'].value,
      role: this.f['role'].value,
      photo: this.f['photo'].value || ''
    };

    this.authService.register(registerRequest).subscribe(
      {
        next: (response: any) => {
          this.success = 'Registration successful! Redirecting to login...';
          console.log('Register successful:', response);
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error: any) => {
          let errorMessage = 'Registration failed. Please try again.';

          // If backend returned 200 but with non-JSON response, it's likely a success
          // (backend issue - should return proper JSON)
          if (error.status === 200) {
            this.success = 'Registration successful! Redirecting to login...';
            console.warn('Backend returned 200 but with invalid JSON format:', error.error.text);
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 2000);
            this.loading = false;
            return;
          }

          // Handle different HTTP status codes
          if (error.status === 403) {
            errorMessage = 'Registration failed. Username or email may already exist.';
          } else if (error.status === 400) {
            errorMessage = error.error?.message || 'Invalid input. Please check your data.';
          } else if (error.status === 409) {
            errorMessage = 'Username or email already exists.';
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          }

          this.error = errorMessage;
          console.error('Register error:', error);
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      }
    );
  }
}
