import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IncidentNotificationService } from '../../../../services/incident-notification/incident-notification.service';
import { IncidentSummary } from '../../../../models/incident-notification.model';

@Component({
  selector: 'app-incident-create',
  templateUrl: './incident-create.component.html',
  styleUrls: ['./incident-create.component.css']
})
export class IncidentCreateComponent {
  isSubmitting = false;
  feedbackMessage = '';
  feedbackType: 'success' | 'error' = 'success';
  readonly incidentForm;

  // AI analysis result displayed after submission
  aiResult: IncidentSummary | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private incidentNotificationService: IncidentNotificationService
  ) {
    this.incidentForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      location: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  submitIncident(): void {
    if (this.incidentForm.invalid) {
      this.incidentForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.aiResult = null;
    const payload = this.incidentForm.getRawValue() as {
      title: string;
      location: string;
      description: string;
    };

    this.incidentNotificationService.createIncident(payload).subscribe({
      next: (result) => {
        this.isSubmitting = false;
        this.aiResult = result;
        this.feedbackMessage = 'Incident submitted successfully! AI has analyzed and classified it.';
        this.feedbackType = 'success';
        this.incidentForm.reset();
      },
      error: () => {
        this.isSubmitting = false;
        this.feedbackMessage = 'Could not submit the incident. Check constraints and retry.';
        this.feedbackType = 'error';
      }
    });
  }

  hasError(controlName: 'title' | 'location' | 'description', error: string): boolean {
    const control = this.incidentForm.get(controlName);
    return !!control && control.touched && control.hasError(error);
  }

  goToIncidentsList(): void {
    this.router.navigate(['/incidents/list']);
  }

  dismissAiResult(): void {
    this.aiResult = null;
  }
}
