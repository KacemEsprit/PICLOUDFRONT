import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <nav aria-label="Page navigation" class="d-flex justify-content-between align-items-center">
      <div class="page-info">
        Showing {{ (pageNumber * pageSize) + 1 }} to {{ Math.min((pageNumber + 1) * pageSize, totalElements) }}
        of {{ totalElements }} results
      </div>
      <ul class="pagination mb-0">
        <li class="page-item" [ngClass]="{ disabled: pageNumber === 0 }">
          <button class="page-link" (click)="previousPage()" [disabled]="pageNumber === 0">
            Previous
          </button>
        </li>

        <li class="page-item" *ngFor="let page of getPageNumbers()" [ngClass]="{ active: page === pageNumber }">
          <button class="page-link" (click)="goToPage(page)">{{ page + 1 }}</button>
        </li>

        <li class="page-item" [ngClass]="{ disabled: pageNumber >= totalPages - 1 }">
          <button class="page-link" (click)="nextPage()" [disabled]="pageNumber >= totalPages - 1">
            Next
          </button>
        </li>
      </ul>
      <div class="page-size-selector">
        <label for="pageSize" class="me-2">Per page:</label>
        <select
          id="pageSize"
          class="form-select form-select-sm"
          [(ngModel)]="pageSize"
          (change)="onPageSizeChange()">
          <option [value]="5">5</option>
          <option [value]="10">10</option>
          <option [value]="25">25</option>
          <option [value]="50">50</option>
        </select>
      </div>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
      margin-top: 1rem;
    }

    .page-info {
      font-size: 0.9rem;
      color: #666;
      min-width: 200px;
    }

    .page-size-selector {
      display: flex;
      align-items: center;
      min-width: 150px;
    }

    .form-select-sm {
      width: 60px;
    }

    @media (max-width: 768px) {
      nav {
        flex-direction: column;
        gap: 1rem;
      }

      .page-info {
        order: 1;
      }

      .pagination {
        order: 2;
      }

      .page-size-selector {
        order: 3;
      }
    }
  `]
})
export class PaginationComponent {
  @Input() pageNumber: number = 0;
  @Input() pageSize: number = 10;
  @Input() totalElements: number = 0;
  @Input() totalPages: number = 1;

  @Output() pageChanged = new EventEmitter<number>();
  @Output() pageSizeChanged = new EventEmitter<number>();

  Math = Math;

  previousPage(): void {
    if (this.pageNumber > 0) {
      this.pageNumber--;
      this.pageChanged.emit(this.pageNumber);
    }
  }

  nextPage(): void {
    if (this.pageNumber < this.totalPages - 1) {
      this.pageNumber++;
      this.pageChanged.emit(this.pageNumber);
    }
  }

  goToPage(pageNumber: number): void {
    this.pageNumber = pageNumber;
    this.pageChanged.emit(this.pageNumber);
  }

  onPageSizeChange(): void {
    this.pageNumber = 0; // Reset to first page when changing page size
    this.pageSizeChanged.emit(this.pageSize);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = Math.min(5, this.totalPages);
    let startPage = Math.max(0, this.pageNumber - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages);

    // Adjust start page if we're near the end
    if (endPage - startPage < maxPages) {
      startPage = Math.max(0, endPage - maxPages);
    }

    for (let i = startPage; i < endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
}
