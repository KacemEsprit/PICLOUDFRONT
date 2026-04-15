import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, RegisterRequest } from '../../../services/auth/auth.service';

/**
 * Custom validator for CIN - must be exactly 8 digits
 */
export function cinValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null; // Don't validate empty values
  }
  const value = control.value.toString();
  if (!/^\d{8}$/.test(value)) {
    return { 'invalidCin': true };
  }
  return null;
}

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
  showPassword = false;
  passwordStrength = 0;
  passwordStrengthText = '';
  passwordStrengthColor = '';

  // Role options that match backend RoleEnum (ADMIN excluded - users cannot create admin accounts)
  roles = ['AGENT', 'OPERATOR', 'PASSENGER'];
  roleOptions: { label: string; value: string }[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.roleOptions = this.roles.map(role => ({ label: role, value: role }));

    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required]],
      CIN: ['', [Validators.required, cinValidator]],
      role: ['AGENT', [Validators.required]]
    });

    // Subscribe to password changes to calculate strength
    this.registerForm.get('password')?.valueChanges.subscribe((password: string) => {
      this.calculatePasswordStrength(password);
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  calculatePasswordStrength(password: string): void {
    let strength = 0;
    const feedback = [];

    if (!password) {
      this.passwordStrength = 0;
      this.passwordStrengthText = '';
      this.passwordStrengthColor = '';
      return;
    }

    // Length checks
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (password.length >= 16) strength += 1;

    // Character type checks
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;

    // Normalize strength to 0-4 scale
    this.passwordStrength = Math.min(4, Math.ceil(strength / 2));

    // Set text and color
    switch (this.passwordStrength) {
      case 1:
        this.passwordStrengthText = 'Weak';
        this.passwordStrengthColor = '#ef4444'; // Red
        break;
      case 2:
        this.passwordStrengthText = 'Fair';
        this.passwordStrengthColor = '#f97316'; // Orange
        break;
      case 3:
        this.passwordStrengthText = 'Good';
        this.passwordStrengthColor = '#eab308'; // Yellow
        break;
      case 4:
        this.passwordStrengthText = 'Strong';
        this.passwordStrengthColor = '#22c55e'; // Green
        break;
      default:
        this.passwordStrengthText = '';
        this.passwordStrengthColor = '';
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';

    if (this.registerForm.invalid) {
      if (this.passwordStrength < 2) {
        this.error = 'Password must be at least Fair strength. Include uppercase, lowercase, and numbers.';
      }
      return;
    }

    if (this.passwordStrength < 2) {
      this.error = 'Password must be at least Fair strength level.';
      return;
    }

    this.loading = true;

    const registerRequest: RegisterRequest = {
      username: this.f['username'].value,
      password: this.f['password'].value,
      email: this.f['email'].value,
      name: this.f['name'].value,
      CIN: this.f['CIN'].value,
      role: this.f['role'].value
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
