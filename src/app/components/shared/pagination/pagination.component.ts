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
  @Input() currentPage = 1;
  @Input() pageNumber = 1;
  @Input() totalItems = 0;
  @Input() totalElements = 0;
  @Input() itemsPerPage = 5;
  @Input() pageSize = 5;
  @Input() totalPages = 0;
  @Output() pageChanged = new EventEmitter<number>();
  @Output() pageSizeChanged = new EventEmitter<number>();

  get effectiveTotalItems(): number {
    return this.totalItems || this.totalElements;
  }

  get effectiveItemsPerPage(): number {
    return this.itemsPerPage || this.pageSize;
  }

  get effectiveTotalPages(): number {
    return this.totalPages || Math.ceil(this.effectiveTotalItems / this.effectiveItemsPerPage);
  }

  get pages(): number[] {
    return Array.from({ length: this.effectiveTotalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.effectiveTotalPages) {
      this.pageChanged.emit(page);
    }
  }
}
