import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UserDto, UserFilterParams, UserService } from '../../../services/user.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-admin-user-management',
  templateUrl: './admin-user-management.component.html',
  styleUrls: ['./admin-user-management.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminUserManagementComponent implements OnInit {
  users: UserDto[] = [];
  loading = false;
  errorMessage = '';
  selectedIds = new Set<number>();
  activeFilters: string[] = [];
  showAdvancedFilters = false;
  showUserModal = false;
  showConfirmModal = false;
  showQuickView = false;
  userModalMode: 'create' | 'edit' = 'create';
  selectedUser?: UserDto;
  confirmTitle = 'Confirm deletion';
  confirmMessage = 'This action cannot be undone.';
  confirmAction: 'deleteSingle' | 'deleteSelected' = 'deleteSelected';
  confirmTargetId?: number;

  filters: UserFilterParams = {
    page: 0,
    size: 10,
    keyword: '',
    role: 'ALL',
    status: 'all',
    sortBy: 'createdAt',
    sortDir: 'desc'
  };

  stats = {
    total: 0,
    active: 0,
    admins: 0,
    agents: 0,
    operators: 0
  };

  public Math = Math;

  constructor(
    private userService: UserService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  get pageIndex(): number {
    return this.filters.page ?? 0;
  }

  get pageSize(): number {
    return this.filters.size ?? 10;
  }

  get pageStart(): number {
    return this.pageIndex * this.pageSize + 1;
  }

  get pageEnd(): number {
    return Math.min(this.stats.total, (this.pageIndex + 1) * this.pageSize);
  }

  getSelectedUser(): UserDto | undefined {
    return this.users.find(user => this.selectedIds.has(user.id));
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';
    this.userService.getUsers(this.filters).subscribe({
      next: response => {
        this.users = response.content || [];
        this.stats.total = response.totalElements;
        this.stats.active = this.users.filter(user => user.enabled).length;
        this.stats.admins = this.users.filter(user => user.role === 'ADMIN').length;
        this.stats.agents = this.users.filter(user => user.role === 'AGENT').length;
        this.stats.operators = this.users.filter(user => user.role === 'OPERATOR').length;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Unable to load users. Please try again later.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  searchUsers(): void {
    this.filters.page = 0;
    this.updateChips();
    this.loadUsers();
  }

  applyRoleFilter(role: string): void {
    this.filters.role = role;
    this.filters.page = 0;
    this.searchUsers();
  }

  setDateRange(range: string): void {
    this.filters.page = 0;
    const now = new Date();
    if (range === '7') {
      this.filters.createdAfter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      this.filters.createdBefore = now.toISOString();
    } else if (range === '30') {
      this.filters.createdAfter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      this.filters.createdBefore = now.toISOString();
    } else {
      this.filters.createdAfter = undefined;
      this.filters.createdBefore = undefined;
    }
    this.searchUsers();
  }

  updateChips(): void {
    const chips: string[] = [];
    if (this.filters.keyword) {
      chips.push(`Search: ${this.filters.keyword}`);
    }
    if (this.filters.role && this.filters.role !== 'ALL') {
      chips.push(`Role: ${this.filters.role}`);
    }
    if (this.filters.status && this.filters.status !== 'all') {
      chips.push(`Status: ${this.filters.status}`);
    }
    if (this.filters.createdAfter) {
      chips.push('Date range active');
    }
    this.activeFilters = chips;
  }

  removeFilter(filter: string): void {
    if (filter.startsWith('Search:')) {
      this.filters.keyword = '';
    }
    if (filter.startsWith('Role:')) {
      this.filters.role = 'ALL';
    }
    if (filter.startsWith('Status:')) {
      this.filters.status = 'all';
    }
    if (filter === 'Date range active') {
      this.filters.createdAfter = undefined;
      this.filters.createdBefore = undefined;
    }
    this.searchUsers();
  }

  toggleAdvancedPanel(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.users.forEach(user => this.selectedIds.add(user.id!));
    } else {
      this.selectedIds.clear();
    }
    this.cdr.markForCheck();
  }

  toggleSelection(userId: number): void {
    if (this.selectedIds.has(userId)) {
      this.selectedIds.delete(userId);
    } else {
      this.selectedIds.add(userId);
    }
    this.cdr.markForCheck();
  }

  get selectedCount(): number {
    return this.selectedIds.size;
  }

  openUserModal(mode: 'create' | 'edit', user?: UserDto): void {
    this.userModalMode = mode;
    this.selectedUser = user;
    this.showUserModal = true;
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.selectedUser = undefined;
  }

  onUserSaved(payload: { userData: any; photoFile?: File }): void {
    if (this.userModalMode === 'create') {
      this.userService.createUser(payload.userData).subscribe({
        next: user => {
          if (payload.photoFile) {
            this.userService.uploadUserPhoto(user.id!, payload.photoFile).subscribe();
          }
          this.toastService.success('User created', `${user.username} has been added successfully.`);
          this.closeUserModal();
          this.loadUsers();
        },
        error: () => {
          this.toastService.error('Create failed', 'Unable to create the user.');
        }
      });
      return;
    }

    if (this.selectedUser?.id) {
      this.userService.updateUser(this.selectedUser.id, payload.userData).subscribe({
        next: user => {
          if (payload.photoFile) {
            this.userService.uploadUserPhoto(user.id!, payload.photoFile).subscribe();
          }
          this.toastService.success('User updated', `${user.username} has been updated.`);
          this.closeUserModal();
          this.loadUsers();
        },
        error: () => {
          this.toastService.error('Update failed', 'Unable to update the user.');
        }
      });
    }
  }

  openConfirmDelete(user: UserDto): void {
    this.confirmAction = 'deleteSingle';
    this.confirmTargetId = user.id;
    this.confirmTitle = 'Delete user';
    this.confirmMessage = `Delete ${user.username} permanently? This cannot be undone.`;
    this.showConfirmModal = true;
  }

  openBulkDelete(): void {
    this.confirmAction = 'deleteSelected';
    this.confirmTargetId = undefined;
    this.confirmTitle = 'Delete selected users';
    this.confirmMessage = `Delete ${this.selectedCount} selected users? This action is irreversible.`;
    this.showConfirmModal = true;
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
  }

  executeConfirm(): void {
    if (this.confirmAction === 'deleteSingle' && this.confirmTargetId != null) {
      this.userService.deleteUser(this.confirmTargetId).subscribe({
        next: () => {
          this.toastService.success('Deleted', 'User has been removed.');
          this.showConfirmModal = false;
          this.loadUsers();
        },
        error: () => {
          this.toastService.error('Delete failed', 'Unable to remove the user.');
        }
      });
      return;
    }

    if (this.confirmAction === 'deleteSelected') {
      this.userService.deleteUsers(Array.from(this.selectedIds)).subscribe({
        next: () => {
          this.toastService.success('Bulk delete', 'Selected users have been removed.');
          this.selectedIds.clear();
          this.showConfirmModal = false;
          this.loadUsers();
        },
        error: () => {
          this.toastService.error('Delete failed', 'Unable to remove the selected users.');
        }
      });
    }
  }

  changeRoleInline(user: UserDto, role: string): void {
    this.userService.updateUserRole(user.id!, role).subscribe({
      next: updatedUser => {
        user.role = updatedUser.role;
        this.toastService.success('Role updated', `${updatedUser.username} is now ${updatedUser.role}.`);
        this.cdr.markForCheck();
      },
      error: () => {
        this.toastService.error('Update failed', 'Unable to change role.');
      }
    });
  }

  toggleStatus(user: UserDto): void {
    this.userService.updateUser(user.id!, { enabled: !user.enabled }).subscribe({
      next: updatedUser => {
        user.enabled = updatedUser.enabled;
        this.toastService.info('Status updated', `${updatedUser.username} status changed.`);
        this.cdr.markForCheck();
      },
      error: () => {
        this.toastService.error('Update failed', 'Unable to change status.');
      }
    });
  }

  sortBy(column: string): void {
    if (this.filters.sortBy === column) {
      this.filters.sortDir = this.filters.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.filters.sortBy = column;
      this.filters.sortDir = 'asc';
    }
    this.loadUsers();
  }

  changePage(page: number): void {
    if (page < 0 || page > this.getLastPageIndex()) {
      return;
    }
    this.filters.page = page;
    this.loadUsers();
  }

  changePageSize(size: number): void {
    this.filters.size = size;
    this.filters.page = 0;
    this.loadUsers();
  }

  getLastPageIndex(): number {
    return Math.max(0, Math.ceil(this.stats.total / this.filters.size!) - 1);
  }

  exportCsv(): void {
    this.userService.exportUsers(this.filters).subscribe({
      next: blob => this.downloadBlob(blob, 'users-export.csv'),
      error: () => this.toastService.error('Export failed', 'Unable to export users.')
    });
  }

  downloadBlob(blob: Blob, filename: string): void {
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
  }

  showQuickDetails(user: UserDto): void {
    this.selectedUser = user;
    this.showQuickView = true;
  }

  closeQuickView(): void {
    this.showQuickView = false;
    this.selectedUser = undefined;
  }

  formatDate(value?: string): string {
    if (!value) {
      return '—';
    }
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
  }

  trackByUser(index: number, user: UserDto): number {
    return user.id!;
  }
}
