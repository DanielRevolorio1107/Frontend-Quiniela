import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../enviroments/enviroments';
import { Fase, FaseCreate, FaseUpdate } from '../interfaces/fase.interface';

@Injectable({ providedIn: 'root' })
export class FaseAdminService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/fase`;

  getByTorneo(torneoId: number): Observable<Fase[]> {
    return this.http.get<Fase[]>(`${this.apiUrl}/torneo/${torneoId}`);
  }

  create(data: FaseCreate): Observable<Fase> {
    return this.http.post<Fase>(this.apiUrl, data);
  }

  update(id: number, data: FaseUpdate): Observable<Fase> {
    return this.http.put<Fase>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}