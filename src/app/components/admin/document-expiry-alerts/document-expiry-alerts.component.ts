import { Component, OnInit, OnDestroy } from '@angular/core';
import { DocumentExpiryService, ExpiryAlertResponse } from '../../../services/documents/document-expiry.service';
import { LegalDocument } from '../../../models';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-document-expiry-alerts',
  templateUrl: './document-expiry-alerts.component.html',
  styleUrls: ['./document-expiry-alerts.component.css']
})
export class DocumentExpiryAlertsComponent implements OnInit, OnDestroy {
  criticalDocuments: LegalDocument[] = [];
  upcomingDocuments: LegalDocument[] = [];
  expiredDocuments: LegalDocument[] = [];

  loading = false;
  error: string | null = null;

  expiryStats: any = null;
  activeTab: 'critical' | 'upcoming' | 'expired' = 'critical';

  // Expose service for template
  documentExpiryService: DocumentExpiryService;

  private destroy$ = new Subject<void>();

  constructor(private _documentExpiryService: DocumentExpiryService) {
    this.documentExpiryService = _documentExpiryService;
  }

  ngOnInit(): void {
    this.loadExpiryAlerts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadExpiryAlerts(): void {
    this.loading = true;
    this.error = null;

    // Load critical (7 days)
    this._documentExpiryService.getCriticalExpiringDocuments(0, 50)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ExpiryAlertResponse) => {
          this.criticalDocuments = response.content;
          if (response.expiryStats) {
            this.expiryStats = response.expiryStats;
          }
          this.loadUpcomingDocuments();
        },
        error: (err: any) => {
          console.error('Error loading critical documents:', err);
          this.loadUpcomingDocuments();
        }
      });
  }

  private loadUpcomingDocuments(): void {
    this._documentExpiryService.getUpcomingExpiringDocuments(0, 50)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ExpiryAlertResponse) => {
          this.upcomingDocuments = response.content;
          this.loadExpiredDocuments();
        },
        error: (err: any) => {
          console.error('Error loading upcoming documents:', err);
          this.loadExpiredDocuments();
        }
      });
  }

  private loadExpiredDocuments(): void {
    this._documentExpiryService.getExpiredDocuments(0, 50)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ExpiryAlertResponse) => {
          this.expiredDocuments = response.content;
          this.loading = false;
        },
        error: (err: any) => {
          this.loading = false;
          this.error = 'Failed to load some expiry data';
        }
      });
  }

  switchTab(tab: 'critical' | 'upcoming' | 'expired'): void {
    this.activeTab = tab;
  }

  getDaysUntilExpiry(expiryDate: string): number {
    return this.documentExpiryService.getDaysUntilExpiry(expiryDate);
  }

  getUrgencyLabel(expiryDate: string): string {
    return this.documentExpiryService.getUrgencyLabel(expiryDate);
  }

  getUrgencyColor(expiryDate: string): string {
    const level = this.documentExpiryService.getUrgencyLevel(expiryDate);
    const colors: Record<string, string> = {
      critical: '#dc3545',
      warning: '#f57f17',
      info: '#1a73e8'
    };
    return colors[level] || '#1a73e8';
  }

  getUrgencyIcon(expiryDate: string): string {
    const level = this.documentExpiryService.getUrgencyLevel(expiryDate);
    const icons: Record<string, string> = {
      critical: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };
    return icons[level] || 'fas fa-info-circle';
  }

  refresh(): void {
    this.loadExpiryAlerts();
  }

  get currentDocuments(): LegalDocument[] {
    switch (this.activeTab) {
      case 'critical':
        return this.criticalDocuments;
      case 'upcoming':
        return this.upcomingDocuments;
      case 'expired':
        return this.expiredDocuments;
      default:
        return [];
    }
  }

  get tabCounts() {
    return {
      critical: this.criticalDocuments.length,
      upcoming: this.upcomingDocuments.length,
      expired: this.expiredDocuments.length
    };
  }
}
