import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../services/auth/auth.service';
import { AdminUserService } from '../../services/admin/admin-user.service';
import { DocumentService } from '../../services/documents/document.service';
import { UserActivityService } from '../../services/admin/user-activity.service';
import { DocumentExpiryService } from '../../services/documents/document-expiry.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-dhasbord',
  templateUrl: './admin-dhasbord.component.html',
  styleUrls: ['./admin-dhasbord.component.css']
})
export class AdminDhasbordComponent implements OnInit {
  currentUser$!: Observable<User | null>;
  currentUser: User | null = null;

  totalUsers: number = 0;
  totalDocuments: number = 0;
  loadingStats: boolean = true;

  constructor(
    private authService: AuthService,
    private adminUserService: AdminUserService,
    private documentService: DocumentService,
    private userActivityService: UserActivityService,
    private documentExpiryService: DocumentExpiryService
  ) {}

  ngOnInit(): void {
    this.currentUser$ = this.authService.currentUser$;
    this.currentUser = this.authService.currentUserValue;
    this.loadDashboardStats();
  }

  private loadDashboardStats(): void {
    this.loadingStats = true;

    // Fetch total users
    this.adminUserService.getAllUsers({ page: 0, size: 1 }).subscribe({
      next: (response) => {
        this.totalUsers = response.totalElements;
      },
      error: (error) => {
        console.error('Error fetching total users:', error);
        this.totalUsers = 0;
      }
    });

    // Fetch total documents
    this.documentService.searchDocuments({ page: 0, size: 1, documentTypeId: undefined, userId: undefined, status: undefined }).subscribe({
      next: (response) => {
        this.totalDocuments = response.totalElements;
        this.loadingStats = false;
      },
      error: (error) => {
        console.error('Error fetching total documents:', error);
        this.totalDocuments = 0;
        this.loadingStats = false;
      }
    });
  }
}
