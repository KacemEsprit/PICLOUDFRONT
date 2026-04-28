import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket, TransportType } from '../models/ticket.model';

@Injectable({ providedIn: 'root' })
export class TicketService {

  private url = '/api/tickets';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.url);
  }

  getDisponibles(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.url}/disponibles`);
  }

  getByTransport(type: string): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.url}/transport/${type}`);
  }

  getDisponiblesByTransport(type: string): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.url}/disponibles/${type}`);
  }

  getTransportTypes(): Observable<TransportType[]> {
    return this.http.get<TransportType[]>(`${this.url}/transport-types`);
  }

  getById(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.url}/${id}`);
  }

  create(ticket: Ticket): Observable<Ticket> {
    return this.http.post<Ticket>(this.url, ticket);
  }

  update(id: number, ticket: Ticket): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.url}/${id}`, ticket);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }

  acheter(id: number): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.url}/${id}/acheter`, {});
  }
}

