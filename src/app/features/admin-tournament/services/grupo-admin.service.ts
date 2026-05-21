import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../enviroments/enviroments';
import { Grupo, GrupoCreate, GrupoUpdate, EquipoSelect } from '../interfaces/grupo.interface';

@Injectable({ providedIn: 'root' })
export class GrupoAdminService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/grupo`;
  private equipoUrl = `${environment.apiUrl}/equipo`;

  getByTorneo(torneoId: number): Observable<Grupo[]> {
    return this.http.get<Grupo[]>(`${this.apiUrl}/torneo/${torneoId}`);
  }

  create(data: GrupoCreate): Observable<Grupo> {
    return this.http.post<Grupo>(this.apiUrl, data);
  }

  update(id: number, data: GrupoUpdate): Observable<Grupo> {
    return this.http.put<Grupo>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  asignarEquipo(grupoId: number, equipoId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${grupoId}/equipos/${equipoId}`, {});
  }

  removerEquipo(grupoId: number, equipoId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${grupoId}/equipos/${equipoId}`);
  }

  getEquiposSelect(): Observable<EquipoSelect[]> {
    return this.http.get<EquipoSelect[]>(`${this.equipoUrl}/select`);
  }
}