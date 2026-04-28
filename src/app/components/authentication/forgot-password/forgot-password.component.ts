import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PasswordResetService } from '../../../services/auth/password-reset.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  loading = false;
  submitted = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private passwordResetService: PasswordResetService
  ) {}

  ngOnInit(): void {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get f() {
    return this.forgotPasswordForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    // Stop if form is invalid
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.loading = true;

    const email = this.f['email'].value;

    this.passwordResetService.forgetPassword(email).subscribe({
      next: (response: any) => {
        console.log('Forgot password response:', response);
        this.successMessage = response.message || 'Reset email sent successfully! Please check your inbox.';
        this.forgotPasswordForm.reset();
        this.submitted = false;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Forgot password error full object:', error);
        console.error('Error status:', error.status);
        console.error('Error body:', error.error);

        // Try to extract the most specific error message
        let errorMessage = 'Failed to send reset email. Please try again.';

        if (error.error) {
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error.error) {
            errorMessage = error.error.error;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error.errors && Array.isArray(error.error.errors) && error.error.errors.length > 0) {
            errorMessage = error.error.errors[0];
          } else if (error.error.detail) {
            errorMessage = error.error.detail;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }

        console.error('Final error message:', errorMessage);
        this.errorMessage = errorMessage;
        this.loading = false;
      }
    });
  }

  resetForm(): void {
    this.forgotPasswordForm.reset();
    this.submitted = false;
    this.successMessage = '';
    this.errorMessage = '';
  }
}
