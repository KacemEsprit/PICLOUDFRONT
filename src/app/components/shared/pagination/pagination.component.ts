import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent {
  // API ton projet
  @Input() currentPage = 1;
  @Input() totalItems = 0;
  @Input() itemsPerPage = 5;
  @Output() pageChanged = new EventEmitter<number>();

  // API collegue
  @Input() set pageNumber(val: number) { this.currentPage = val; }
  @Input() set totalElements(val: number) { this.totalItems = val; }
  @Input() set pageSize(val: number) { this.itemsPerPage = val; }
  @Input() totalPages: number | null = null;
  @Output() pageSizeChanged = new EventEmitter<number>();

  get computedTotalPages(): number {
    if (this.totalPages !== null) return this.totalPages;
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get pages(): number[] {
    return Array.from({ length: this.computedTotalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.computedTotalPages) {
      this.pageChanged.emit(page);
    }
  }

  changePageSize(size: number): void {
    this.pageSizeChanged.emit(size);
  }
}
