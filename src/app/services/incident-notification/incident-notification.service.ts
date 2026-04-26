import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import {
  AppNotification,
  IncidentPayload,
  IncidentSummary
} from '../../models/incident-notification.model';

@Injectable({
  providedIn: 'root'
})
export class IncidentNotificationService {
  private readonly incidentsUrl = '/incidents';
  private readonly notificationsUrl = '/notifications';

  private readonly notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  readonly notifications$ = this.notificationsSubject.asObservable();

  private readonly unreadCountSubject = new BehaviorSubject<number>(0);
  readonly unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  getAllIncidents(): Observable<IncidentSummary[]> {
    return this.http.get<IncidentSummary[]>(this.incidentsUrl);
  }

  createIncident(payload: IncidentPayload): Observable<IncidentSummary> {
    return this.http.post<IncidentSummary>(`${this.incidentsUrl}/add`, payload);
  }

  updateIncident(incidentId: number, payload: IncidentPayload): Observable<IncidentSummary> {
    return this.http.put<IncidentSummary>(`${this.incidentsUrl}/update/${incidentId}`, payload);
  }

  getMyNotifications(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(`${this.notificationsUrl}/my`).pipe(
      tap((notifications) => this.setNotifications(notifications))
    );
  }

  markNotificationAsRead(notificationId: number): Observable<AppNotification> {
    return this.http.patch<AppNotification>(`${this.notificationsUrl}/${notificationId}/read`, {}).pipe(
      tap((updated) => {
        const notifications = this.notificationsSubject.value.map((item) =>
          item.id === updated.id ? updated : item
        );
        this.setNotifications(notifications);
      })
    );
  }

  refreshNotifications(): void {
    this.getMyNotifications().subscribe({
      error: () => {
        // Keep UI stable if endpoint is temporarily unavailable.
      }
    });
  }

  private setNotifications(notifications: AppNotification[]): void {
    const sorted = [...notifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    this.notificationsSubject.next(sorted);
    this.unreadCountSubject.next(sorted.filter((item) => item.status !== 'READ').length);
  }
}
