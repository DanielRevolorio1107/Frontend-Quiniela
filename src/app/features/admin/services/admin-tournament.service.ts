import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../enviroments/enviroments';

@Injectable({
  providedIn: 'root'
})
export class AdminTournamentService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // TORNEOS
  getAll(page = 1, pageSize = 20) {
    return this.http.get(`${this.apiUrl}/torneo?page=${page}&pageSize=${pageSize}`);
  }

  getById(id: number) {
    return this.http.get(`${this.apiUrl}/torneo/${id}`);
  }

  create(data: {
    nombre: string;
    año: number;
    paisSede: string;
    fechaInicio: string;
    fechaFin: string;
  }) {
    return this.http.post(`${this.apiUrl}/torneo`, data);
  }

  update(id: number, data: {
    nombre?: string;
    paisSede?: string;
    fechaInicio?: string;
    fechaFin?: string;
  }) {
    return this.http.put(`${this.apiUrl}/torneo/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/torneo/${id}`);
  }

  getSelect() {
    return this.http.get(`${this.apiUrl}/torneo/select`);
  }

  // FASES
  getFasesByTorneo(torneoId: number) {
    return this.http.get(`${this.apiUrl}/fase/torneo/${torneoId}`);
  }

  getFasesSelect(torneoId: number) {
    return this.http.get(`${this.apiUrl}/fase/select/${torneoId}`);
  }

  createFase(data: { nombre: string; orden: number; torneoId: number }) {
    return this.http.post(`${this.apiUrl}/fase`, data);
  }

  updateFase(id: number, data: { nombre?: string; orden?: number }) {
    return this.http.put(`${this.apiUrl}/fase/${id}`, data);
  }

  deleteFase(id: number) {
    return this.http.delete(`${this.apiUrl}/fase/${id}`);
  }

  // GRUPOS
  getGruposByTorneo(torneoId: number) {
    return this.http.get(`${this.apiUrl}/grupo/torneo/${torneoId}`);
  }

  getGruposSelect(torneoId: number) {
    return this.http.get(`${this.apiUrl}/grupo/select/${torneoId}`);
  }

  createGrupo(data: { nombre: string; torneoId: number }) {
    return this.http.post(`${this.apiUrl}/grupo`, data);
  }

  updateGrupo(id: number, data: { nombre?: string }) {
    return this.http.put(`${this.apiUrl}/grupo/${id}`, data);
  }

  deleteGrupo(id: number) {
    return this.http.delete(`${this.apiUrl}/grupo/${id}`);
  }

  asignarEquipoAGrupo(grupoId: number, equipoId: number) {
    return this.http.post(`${this.apiUrl}/grupo/${grupoId}/equipos/${equipoId}`, {});
  }

  asignarVariosEquiposAGrupo(grupoId: number, equipoIds: number[]) {
    return this.http.post(`${this.apiUrl}/grupo/${grupoId}/equipos`, { equipoIds });
  }

  removerEquipoDeGrupo(grupoId: number, equipoId: number) {
    return this.http.delete(`${this.apiUrl}/grupo/${grupoId}/equipos/${equipoId}`);
  }

  getEquiposSelect() {
  return this.http.get(`${this.apiUrl}/equipo/select`);
}

  // ESTADIOS
  getEstadiosSelect() {
    return this.http.get(`${this.apiUrl}/estadio/select`);
  }

  // PARTIDOS
  getPartidosByTorneo(torneoId: number) {
    return this.http.get(`${this.apiUrl}/partido/torneo/${torneoId}`);
  }

  createPartido(data: {
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

  updatePartido(id: number, data: {
    equipoLocalId?: number | null;
    equipoVisitanteId?: number | null;
    descripcionLocal?: string | null;
    descripcionVisitante?: string | null;
    fechaHora?: string | null;
    estadioId?: number | null;
  }) {
    return this.http.put(`${this.apiUrl}/partido/${id}`, data);
  }

  deletePartido(id: number) {
    return this.http.delete(`${this.apiUrl}/partido/${id}`);
  }

}