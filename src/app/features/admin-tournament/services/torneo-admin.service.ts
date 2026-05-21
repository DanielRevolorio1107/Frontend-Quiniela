import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../enviroments/enviroments';
import { Torneo, TorneoCreate, TorneoSelect, TorneoUpdate } from '../interfaces/torneo.interface';

@Injectable({ providedIn: 'root' })
export class TorneoAdminService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/torneo`;

  getAll(): Observable<Torneo[]> {
    return this.http.get<Torneo[]>(this.apiUrl);
  }

  getSelect(): Observable<TorneoSelect[]> {
    return this.http.get<TorneoSelect[]>(`${this.apiUrl}/select`);
  }

  getById(id: number): Observable<Torneo> {
    return this.http.get<Torneo>(`${this.apiUrl}/${id}`);
  }

  create(data: TorneoCreate): Observable<Torneo> {
    return this.http.post<Torneo>(this.apiUrl, data);
  }

  update(id: number, data: TorneoUpdate): Observable<Torneo> {
    return this.http.put<Torneo>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}