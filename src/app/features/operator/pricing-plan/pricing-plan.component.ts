import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PricingPlan, PricingType, TransportType } from '../../../core/models/models';

@Component({
  selector: 'app-pricing-plan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="page-header">
  <div>
    <div class="breadcrumb"><span>Operator</span> <span>/</span> Pricing Plans</div>
    <h1 class="page-title"><i class="fas fa-tags text-blue"></i> Pricing Plans</h1>
    <p class="page-subtitle">{{ plans.length }} plan(s) available</p>
  </div>
  <button class="btn btn-primary" (click)="openModal()">
    <i class="fas fa-plus"></i> New Plan
  </button>
</div>

<!-- FILTERS -->
<div class="filters-bar">
  <div class="filter-search-wrap">
    <i class="fas fa-search"></i>
    <input type="text" class="filter-input" placeholder="Search by name..."
           [(ngModel)]="search" style="width:220px" (ngModelChange)="resetPage()">
  </div>
  <select class="filter-select" [(ngModel)]="filterType" (ngModelChange)="resetPage()">
    <option value="">All types</option>
    <option value="FREE">FREE</option>
    <option value="BASIC">BASIC</option>
    <option value="PREMIUM">PREMIUM</option>
  </select>
  <select class="filter-select" [(ngModel)]="filterTransport" (ngModelChange)="resetPage()">
    <option value="">All transports</option>
    <option value="BUS">BUS</option>
    <option value="METRO">METRO</option>
    <option value="TRAIN">TRAIN</option>
    <option value="BATTAH">BATTAH</option>
    <option value="LOUAGE">LOUAGE</option>
  </select>
</div>

<div class="card">
  <div class="table-wrapper">
    <table class="data-table">
      <thead>
        <tr>
          <th>Plan</th><th>Type</th><th>Price</th><th>Duration</th>
          <th>Transport</th><th>Created by</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let p of paginated">
          <td>
            <div class="cell-entity">
              <div class="cell-avatar" [ngClass]="avatarClass(p.type)"><i class="fas fa-tag"></i></div>
              <div>
                <div class="cell-entity-name">{{ p.nom }}</div>
                <div class="fs-sm text-muted">{{ p.description }}</div>
              </div>
            </div>
          </td>
          <td><span class="cell-tag" [ngClass]="typeClass(p.type)">{{ p.type }}</span></td>
          <td><strong>{{ p.prix | number:'1.2-2' }} DT</strong></td>
          <td>{{ p.dureeEnJours }} days</td>
          <td>
            <span class="cell-tag cell-tag-teal" *ngIf="p.transportType">
              <i class="fas" [ngClass]="transportIcon(p.transportType)"></i> {{ p.transportType }}
            </span>
            <span class="cell-muted" *ngIf="!p.transportType">—</span>
          </td>
          <td class="text-muted fs-sm">{{ p.createdByUsername || '—' }}</td>
          <td>
            <div class="cell-actions">
              <button class="btn-icon btn-icon-edit" (click)="openModal(p)" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn-icon btn-icon-delete" (click)="delete(p)" title="Delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
        <tr *ngIf="paginated.length === 0">
          <td colspan="7">
            <div class="table-empty">
              <i class="fas fa-tags"></i>
              <div class="fw-bold">No plans found</div>
              <div class="fs-sm">Create your first pricing plan</div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- PAGINATION -->
  <div class="pagination-bar" *ngIf="totalPages > 1">
    <button class="btn btn-outline btn-sm" (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1">
      <i class="fas fa-chevron-left"></i>
    </button>
    <span class="pagination-info">Page {{ currentPage }} / {{ totalPages }} ({{ filtered.length }} results)</span>
    <button class="btn btn-outline btn-sm" (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages">
      <i class="fas fa-chevron-right"></i>
    </button>
  </div>
</div>

<!-- MODAL — transport is automatically set from operator profile, no selector needed -->
<div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
  <div class="modal" (click)="$event.stopPropagation()">
    <div class="modal-header">
      <div class="modal-title">
        <i class="fas fa-tag text-blue"></i> {{ editing ? 'Edit Plan' : 'New Pricing Plan' }}
      </div>
      <button class="modal-close" (click)="closeModal()"><i class="fas fa-times"></i></button>
    </div>
    <div class="modal-body">
      <div class="alert alert-danger" *ngIf="formError">
        <i class="fas fa-times-circle"></i> {{ formError }}
      </div>

      <!-- Transport info — read-only from operator profile -->
      <div class="alert alert-info" *ngIf="profileTransportType" style="margin-bottom:16px">
        <i class="fas" [ngClass]="transportIcon(profileTransportType)"></i>
        This plan will automatically be linked to transport
        <strong>{{ profileTransportType }}</strong> (from your operator profile).
      </div>

      <div class="form-grid form-grid-2">
        <div class="form-group">
          <label class="form-label">Name <span class="required">*</span></label>
          <input type="text" class="form-control" [(ngModel)]="form.nom"
                 placeholder="e.g. Monthly Bus Pass"
                 [class.error]="submitted && !form.nom?.trim()"/>
          <div class="form-error" *ngIf="submitted && !form.nom?.trim()">Name is required.</div>
        </div>
        <div class="form-group">
          <label class="form-label">Type <span class="required">*</span></label>
          <select class="form-control" [(ngModel)]="form.type">
            <option value="FREE">FREE</option>
            <option value="BASIC">BASIC</option>
            <option value="PREMIUM">PREMIUM</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Price (DT) <span class="required">*</span></label>
          <input type="number" class="form-control" [(ngModel)]="form.prix"
                 placeholder="0.00" step="0.01" min="0"
                 [class.error]="submitted && (form.prix == null || form.prix < 0)"/>
          <div class="form-error" *ngIf="submitted && (form.prix == null || form.prix < 0)">
            Price must be >= 0.
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Duration (days) <span class="required">*</span></label>
          <input type="number" class="form-control" [(ngModel)]="form.dureeEnJours"
                 placeholder="30" min="1"
                 [class.error]="submitted && (!form.dureeEnJours || form.dureeEnJours <= 0)"/>
          <div class="form-error" *ngIf="submitted && (!form.dureeEnJours || form.dureeEnJours <= 0)">
            Duration must be > 0.
          </div>
        </div>
      </div>
      <div class="form-group mt-4">
        <label class="form-label">Description</label>
        <textarea class="form-control" [(ngModel)]="form.description"
                  rows="3" placeholder="Describe this plan..."></textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" (click)="closeModal()">Cancel</button>
      <button class="btn btn-primary" (click)="save()" [disabled]="saving">
        <i class="fas fa-spinner fa-spin" *ngIf="saving"></i>
        <i class="fas fa-save" *ngIf="!saving"></i>
        {{ saving ? 'Saving...' : 'Save Plan' }}
      </button>
    </div>
  </div>
</div>
  `
})
export class PricingPlanComponent implements OnInit {
  plans: PricingPlan[] = [];
  search = ''; filterType = ''; filterTransport = '';
  showModal = false; editing = false; saving = false;
  submitted = false; formError = '';
  form: PricingPlan = { nom: '', description: '', prix: 0, dureeEnJours: 30, type: PricingType.BASIC };
  editingId?: number;

  currentPage = 1;
  readonly pageSize = 8;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private notif: NotificationService
  ) {}

  ngOnInit() { this.load(); }

  load() {
    const opId = this.auth.getUserId();
    if (opId == null) { this.notif.error('Invalid session: please log in again.'); return; }
    this.api.getPlansByOperator(opId).subscribe(d => this.plans = d);
  }

  get filtered(): PricingPlan[] {
    return this.plans.filter(p =>
      (!this.search || p.nom.toLowerCase().includes(this.search.toLowerCase())) &&
      (!this.filterType || p.type === this.filterType) &&
      (!this.filterTransport || p.transportType === this.filterTransport)
    );
  }

  get totalPages(): number { return Math.ceil(this.filtered.length / this.pageSize) || 1; }

  get paginated(): PricingPlan[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  goToPage(p: number) { if (p >= 1 && p <= this.totalPages) this.currentPage = p; }
  resetPage() { this.currentPage = 1; }

  openModal(p?: PricingPlan) {
    this.editing    = !!p;
    this.editingId  = p?.id;
    this.submitted  = false;
    this.formError  = '';
    this.form = p
      ? { ...p }
      : { nom: '', description: '', prix: 0, dureeEnJours: 30, type: PricingType.BASIC };
    this.showModal = true;
  }

  closeModal() { this.showModal = false; this.submitted = false; this.formError = ''; }

  // Read-only — just for display in the info alert
  get profileTransportType(): TransportType | null {
    const raw = this.auth.getUser()?.transportType;
    if (raw == null || String(raw).trim() === '') return null;
    return String(raw).toUpperCase() as TransportType;
  }

  save() {
    this.submitted = true;
    this.formError = '';

    if (!this.form.nom?.trim())                          { this.formError = 'Plan name is required.'; return; }
    if (this.form.prix == null || this.form.prix < 0)    { this.formError = 'Price must be >= 0.'; return; }
    if (!this.form.dureeEnJours || this.form.dureeEnJours <= 0) { this.formError = 'Duration must be > 0.'; return; }

    const opId = this.auth.getUserId();
    if (opId == null) { this.notif.error('Invalid session: please log in again.'); return; }

    // ── Transport is set automatically by the backend from the operator's profile ──
    // No need to send it from the frontend
    const payload: PricingPlan = { ...this.form };
    this.saving = true;

    const obs = this.editing
      ? this.api.updatePlan(this.editingId!, payload, opId)
      : this.api.createPlan(payload, opId);

    obs.subscribe({
      next: () => {
        this.notif.success(this.editing ? 'Plan updated successfully.' : 'Plan created successfully.');
        this.load(); this.closeModal(); this.saving = false;
      },
      error: (err) => {
        this.formError = err.error?.message || err.error?.error || 'An error occurred while saving.';
        this.saving = false;
      }
    });
  }

  delete(p: PricingPlan) {
    if (!confirm(`Delete plan "${p.nom}"? This action cannot be undone.`)) return;
    const opId = this.auth.getUserId();
    if (opId == null) { this.notif.error('Invalid session.'); return; }
    this.api.deletePlan(p.id!, opId).subscribe({
      next: () => { this.notif.success('Plan deleted.'); this.load(); },
      error: () => this.notif.error('Unable to delete this plan.')
    });
  }

  avatarClass(type: string) {
    return { 'cell-avatar-green': type === 'FREE', 'cell-avatar-blue': type === 'BASIC', 'cell-avatar-purple': type === 'PREMIUM' };
  }
  typeClass(type: string) {
    return { 'cell-tag-green': type === 'FREE', 'cell-tag-blue': type === 'BASIC', 'cell-tag-purple': type === 'PREMIUM' };
  }
  transportIcon(t: string) {
    const u = t ? String(t).toUpperCase() : '';
    return { 'fa-bus': u === 'BUS', 'fa-subway': u === 'METRO', 'fa-train': u === 'TRAIN', 'fa-ship': u === 'BATTAH', 'fa-taxi': u === 'LOUAGE' };
  }
}