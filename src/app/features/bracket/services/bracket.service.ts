import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../enviroments/enviroments';
import { Partido, PartidoUpdate, ResultadoRequest, EquipoSelect, EstadioSelect } from '../interfaces/partido.interface';
import { GrupoBase, ClasificacionRow } from '../interfaces/grupo-clasificacion.interface';

@Injectable({ providedIn: 'root' })
export class BracketService {
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  getPartidos(torneoId: number): Observable<Partido[]> {
    return this.http.get<Partido[]>(`${this.api}/partido/torneo/${torneoId}`);
  }

  getGrupos(torneoId: number): Observable<GrupoBase[]> {
    return this.http.get<GrupoBase[]>(`${this.api}/grupo/torneo/${torneoId}`);
  }

  getClasificacion(grupoId: number): Observable<ClasificacionRow[]> {
    return this.http.get<ClasificacionRow[]>(`${this.api}/grupo/${grupoId}/clasificacion`);
  }

  getEquiposSelect(): Observable<EquipoSelect[]> {
    return this.http.get<EquipoSelect[]>(`${this.api}/equipo/select`);
  }

  getEstadiosSelect(): Observable<EstadioSelect[]> {
    return this.http.get<EstadioSelect[]>(`${this.api}/estadio/select`);
  }

  updatePartido(id: number, data: PartidoUpdate): Observable<Partido> {
    return this.http.put<Partido>(`${this.api}/partido/${id}`, data);
  }

  ingresarResultado(id: number, data: ResultadoRequest): Observable<any> {
    return this.http.put(`${this.api}/partido/${id}/resultado`, data);
  }
}