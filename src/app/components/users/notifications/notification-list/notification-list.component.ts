import { Component, OnInit } from '@angular/core';
import { IncidentNotificationService } from '../../../../services/incident-notification/incident-notification.service';
import { AppNotification } from '../../../../models/incident-notification.model';

@Component({
  selector: 'app-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.css']
})
export class NotificationListComponent implements OnInit {
  notifications: AppNotification[] = [];
  filteredNotifications: AppNotification[] = [];
  isLoading = false;
  errorMessage = '';
  searchTerm = '';
  selectedState: 'ALL' | 'UNREAD' | 'READ' = 'ALL';

  constructor(private incidentNotificationService: IncidentNotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.incidentNotificationService.notifications$.subscribe((data) => {
      this.notifications = data;
      this.applyFilters();
    });
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.incidentNotificationService.getMyNotifications().subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Unable to load notifications right now.';
      }
    });
  }

  markAsRead(notification: AppNotification): void {
    if (notification.status === 'READ') {
      return;
    }
    this.incidentNotificationService.markNotificationAsRead(notification.id).subscribe();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStateFilterChange(): void {
    this.applyFilters();
  }

  asDate(value: string): Date {
    return new Date(value);
  }

  private applyFilters(): void {
    const normalizedSearch = this.searchTerm.trim().toLowerCase();
    this.filteredNotifications = this.notifications.filter((item) => {
      const matchesState =
        this.selectedState === 'ALL' ||
        (this.selectedState === 'READ' && item.status === 'READ') ||
        (this.selectedState === 'UNREAD' && item.status !== 'READ');

      const searchableText = `${item.title} ${item.message}`.toLowerCase();
      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);

      return matchesState && matchesSearch;
    });
  }
}
