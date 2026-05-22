import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../enviroments/enviroments';

@Injectable({
  providedIn: 'root'
})
export class PartidoAdminService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAll(page = 1, pageSize = 50) {
    return this.http.get(`${this.apiUrl}/partido?page=${page}&pageSize=${pageSize}`);
  }

  getById(id: number) {
    return this.http.get(`${this.apiUrl}/partido/${id}`);
  }

  getByTorneo(torneoId: number) {
    return this.http.get(`${this.apiUrl}/partido/torneo/${torneoId}`);
  }

  getByFase(faseId: number) {
    return this.http.get(`${this.apiUrl}/partido/fase/${faseId}`);
  }

  getByGrupo(grupoId: number) {
    return this.http.get(`${this.apiUrl}/partido/grupo/${grupoId}`);
  }

  getPendientes(torneoId: number) {
    return this.http.get(`${this.apiUrl}/partido/pendientes/${torneoId}`);
  }

  create(data: {
    torneoId: number;
    faseId: number;
    grupoId?: number | null;
    equipoLocalId?: number | null;
    equipoVisitanteId?: number | null;
    descripcionLocal?: string | null;
    descripcionVisitante?: string | null;
    fechaHora: string;
    estadioId: number;
  }) {
    return this.http.post(`${this.apiUrl}/partido`, data);
  }

  update(id: number, data: {
    equipoLocalId?: number | null;
    equipoVisitanteId?: number | null;
    descripcionLocal?: string | null;
    descripcionVisitante?: string | null;
    fechaHora?: string | null;
    estadioId?: number | null;
  }) {
    return this.http.put(`${this.apiUrl}/partido/${id}`, data);
  }

  ingresarResultado(id: number, data: { golesLocal: number; golesVisitante: number }) {
    return this.http.put(`${this.apiUrl}/partido/${id}/resultado`, data);
  }

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/partido/${id}`);
  }
}