import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export type UserRole = 'ADMIN' | 'OPERATOR' | 'AGENT' | 'PASSENGER' | string;

export interface User {
  id?: number;
  username?: string;
  email?: string;
  name?: string;
  role: UserRole;
  token?: string;
  [key: string]: unknown;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  name: string;
  CIN: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  public isAuthenticated$: Observable<boolean>;

  constructor(private http: HttpClient) {
    const stored = this.loadUserFromStorage();
    this.currentUserSubject = new BehaviorSubject<User | null>(stored);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.isAuthenticated$ = this.currentUser$.pipe(map(u => !!u));
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  getToken(): string | null {
    const user = this.currentUserValue;
    if (user && user.token) {
      return user.token;
    }
    return localStorage.getItem('token') ??
           sessionStorage.getItem('token') ??
           null;
  }

  login(req: LoginRequest): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, req).pipe(
      tap(response => {
        const user: User = {
          id: response.id,
          username: response.username,
          email: response.email,
          name: response.name,
          role: response.role || '',
          token: response.token
        };
        localStorage.setItem('currentUser', JSON.stringify(user));
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        this.currentUserSubject.next(user);
      })
    );
  }

  register(req: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/register`, req);
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  private loadUserFromStorage(): User | null {
    const raw =
      localStorage.getItem('currentUser') ??
      localStorage.getItem('user') ??
      sessionStorage.getItem('currentUser') ??
      sessionStorage.getItem('user');

    if (!raw) return null;

    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
