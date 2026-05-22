import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../enviroments/enviroments';
import { Partido } from '../interfaces/partido.interface';
import { GrupoConClasificacion } from '../interfaces/grupo-clasificacion.interface';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getPartidos(torneoId: number): Observable<Partido[]> {
    return this.http.get<Partido[]>(`${this.apiUrl}/partido/torneo/${torneoId}`);
  }

  getGrupos(torneoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/grupo/torneo/${torneoId}`);
  }

  getClasificacion(grupoId: number): Observable<GrupoConClasificacion['clasificacion']> {
    return this.http.get<any>(`${this.apiUrl}/grupo/${grupoId}/clasificacion`);
  }
}