import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserActivityService, AuditLog, AuditLogResponse, ActivityActionType } from '../../../services/admin/user-activity.service';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-audit-log',
  templateUrl: './audit-log.component.html',
  styleUrls: ['./audit-log.component.css']
})
export class AuditLogComponent implements OnInit, OnDestroy {
  auditLogs: AuditLog[] = [];
  loading = false;
  error: string | null = null;
  currentPage = 0;
  totalPages = 0;
  totalElements = 0;
  pageSize = 10;

  filterForm!: FormGroup;
  actionTypes: ActivityActionType[] = [
    'LOGIN',
    'LOGOUT',
    'DOCUMENT_UPLOADED',
    'DOCUMENT_VIEWED',
    'DOCUMENT_DOWNLOADED',
    'DOCUMENT_APPROVED',
    'DOCUMENT_REJECTED',
    'USER_CREATED',
    'USER_UPDATED',
    'USER_DELETED',
    'PROFILE_UPDATED',
    'PASSWORD_CHANGED'
  ];

  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  constructor(
    private userActivityService: UserActivityService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupSearchListener();
    this.loadAuditLogs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeForm(): void {
    this.filterForm = this.formBuilder.group({
      username: [''],
      actionType: ['']
    });
  }

  setupSearchListener(): void {
    this.searchSubject$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 0;
        this.loadAuditLogs();
      });
  }

  onSearchChange(username: string): void {
    this.searchSubject$.next(username);
  }

  onActionTypeChange(): void {
    this.currentPage = 0;
    this.loadAuditLogs();
  }

  loadAuditLogs(page: number = 0): void {
    this.loading = true;
    const formValue = this.filterForm.value;

    console.log('=== LOADING AUDIT LOGS ===');
    console.log('Filters:', {
      page,
      pageSize: this.pageSize,
      username: formValue.username || 'none',
      actionType: formValue.actionType || 'none'
    });

    // Build search filters
    const filters = {
      page,
      size: this.pageSize,
      ...(formValue.actionType && { actionType: formValue.actionType })
    };

    this.userActivityService.searchActivityLogs(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: AuditLogResponse) => {
          console.log('=== BACKEND RESPONSE ===');
          console.log('Total Elements:', response.totalElements);
          console.log('Total Pages:', response.totalPages);
          console.log('Current Page:', response.number);
          console.log('Page Size:', response.size);
          console.log('Audit Logs:', response.content);
          console.log('Full Response:', response);

          // Filter by username in frontend if provided
          let filteredLogs = response.content;
          if (formValue.username) {
            const searchTerm = formValue.username.toLowerCase();
            filteredLogs = filteredLogs.filter(log =>
              log.username.toLowerCase().includes(searchTerm)
            );
          }

          // Exclude admin activity logs
          filteredLogs = filteredLogs.filter(log =>
            !log.username.toLowerCase().includes('admin')
          );

          this.auditLogs = filteredLogs;
          this.currentPage = response.number;
          this.totalPages = response.totalPages;
          this.totalElements = response.totalElements;
          this.loading = false;
          this.error = null;

          console.log('=== FILTERED & DISPLAYED LOGS ===');
          console.log('Displayed (admin logs excluded):', this.auditLogs);
        },
        error: (err: any) => {
          console.error('=== ERROR LOADING AUDIT LOGS ===');
          console.error('Error Details:', err);

          this.loading = false;
          this.error = 'Failed to load audit logs';
        }
      });
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadAuditLogs(page);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.goToPage(this.currentPage - 1);
    }
  }

  canGoPrevious(): boolean {
    return this.currentPage > 0;
  }

  canGoNext(): boolean {
    return this.currentPage < this.totalPages - 1;
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.currentPage = 0;
    this.loadAuditLogs();
  }

  getActionLabel(actionType: string): string {
    return this.userActivityService.getActionLabel(actionType as any);
  }

  getActionIcon(actionType: string): string {
    return this.userActivityService.getActionIcon(actionType as any);
  }

  getStatusClass(status: string): string {
    return status === 'SUCCESS' ? 'status-success' : 'status-failed';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }
}
