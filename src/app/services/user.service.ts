import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort?: any;
  first?: boolean;
  last?: boolean;
}

export interface UserFilterParams {
  page?: number;
  size?: number;
  keyword?: string;
  role?: string;
  status?: string;
  createdAfter?: string;
  createdBefore?: string;
  sortBy?: string;
  sortDir?: string;
}

export interface UserDto {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  cin?: number;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserCreatePayload {
  username: string;
  password: string;
  email: string;
  name: string;
  role: string;
  enabled: boolean;
  CIN?: number;
}

export interface UserUpdatePayload {
  username?: string;
  email?: string;
  name?: string;
  role?: string;
  cin?: number;
  enabled?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = 'http://localhost:8081/api/admin/users';

  constructor(private http: HttpClient) {}

  private buildParams(params: UserFilterParams = {}): HttpParams {
    let httpParams = new HttpParams();
    if (params.page != null) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.size != null) {
      httpParams = httpParams.set('size', params.size.toString());
    }
    if (params.keyword) {
      httpParams = httpParams.set('keyword', params.keyword);
    }
    if (params.role && params.role !== 'ALL') {
      httpParams = httpParams.set('role', params.role);
    }
    if (params.status && params.status !== 'all') {
      httpParams = httpParams.set('status', params.status);
    }
    if (params.createdAfter) {
      httpParams = httpParams.set('createdAfter', params.createdAfter);
    }
    if (params.createdBefore) {
      httpParams = httpParams.set('createdBefore', params.createdBefore);
    }
    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params.sortDir) {
      httpParams = httpParams.set('sortDir', params.sortDir);
    }
    return httpParams;
  }

  getUsers(params: UserFilterParams = {}): Observable<PaginatedResponse<UserDto>> {
    const httpParams = this.buildParams(params);
    return this.http.get<PaginatedResponse<UserDto>>(this.apiUrl, { params: httpParams });
  }

  searchUsers(params: UserFilterParams = {}): Observable<PaginatedResponse<UserDto>> {
    const httpParams = this.buildParams(params);
    return this.http.get<PaginatedResponse<UserDto>>(`${this.apiUrl}/search`, { params: httpParams });
  }

  getUserById(id: number): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.apiUrl}/${id}`);
  }

  createUser(payload: UserCreatePayload): Observable<UserDto> {
    return this.http.post<UserDto>(this.apiUrl, payload);
  }

  updateUser(id: number, payload: UserUpdatePayload): Observable<UserDto> {
    return this.http.put<UserDto>(`${this.apiUrl}/${id}`, payload);
  }

  updateUserRole(id: number, role: string): Observable<UserDto> {
    return this.http.patch<UserDto>(`${this.apiUrl}/${id}/role`, { role });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  deleteUsers(ids: number[]): Observable<void> {
    return this.http.request<void>('delete', this.apiUrl, {
      body: { ids }
    });
  }

  uploadUserPhoto(id: number, file: File): Observable<UserDto> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UserDto>(`${this.apiUrl}/${id}/photo`, formData);
  }

  getUserPhoto(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/photo`, {
      responseType: 'blob'
    });
  }

  exportUsers(params: UserFilterParams = {}): Observable<Blob> {
    const httpParams = this.buildParams(params);
    return this.http.get(`${this.apiUrl}/export`, {
      params: httpParams,
      responseType: 'blob'
    });
  }
}
