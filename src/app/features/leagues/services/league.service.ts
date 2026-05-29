import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../enviroments/enviroments';
import { CreateLeagueRequest } from '../Interfaces/create-league-request.interface';
import { LeagueJoinRequest } from '../Interfaces/league-join-request.interface';
import { LeagueApprovalRequest } from '../Interfaces/league-approval-request.interface';
import { LeagueUpdateRequest } from '../Interfaces/league-update-request.interface';
import { LeagueInvitationCreateRequest } from '../Interfaces/league-invitation-create-request.interface';
import { LeagueInvitationResponseRequest } from '../Interfaces/league-invitation-response-request.interface';

@Injectable({
  providedIn: 'root'
})
export class LeagueService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/liga`;

  getAll(page = 1, pageSize = 10) {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    return this.http.get(this.apiUrl, { params });
  }

  getMisLigas(page = 1, pageSize = 10) {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    return this.http.get(`${this.apiUrl}/mis-ligas`, { params });
  }

  search(nombre: string, page = 1, pageSize = 10) {
    const params = new HttpParams()
      .set('nombre', nombre)
      .set('page', page)
      .set('pageSize', pageSize);

    return this.http.get(`${this.apiUrl}/buscar`, { params });
  }

  getById(id: number) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getMiembros(ligaId: number) {
    return this.http.get(`${this.apiUrl}/${ligaId}/miembros`);
  }

  getMiembrosPendientes(ligaId: number) {
    return this.http.get(`${this.apiUrl}/${ligaId}/miembros/pendientes`);
  }

  create(data: CreateLeagueRequest) {
    return this.http.post(this.apiUrl, data);
  }

  unirse(ligaId: number, data: LeagueJoinRequest) {
    return this.http.post(`${this.apiUrl}/${ligaId}/unirse`, data);
  }

  aprobarMiembro(ligaId: number, data: LeagueApprovalRequest) {
    return this.http.post(`${this.apiUrl}/${ligaId}/aprobar`, data);
  }

  update(id: number, data: LeagueUpdateRequest) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  salir(ligaId: number) {
    return this.http.delete(`${this.apiUrl}/${ligaId}/salir`);
  }

  getRanking(ligaId: number) {
    return this.http.get(`${this.apiUrl}/${ligaId}/ranking`);
  }

  sendInvitation(ligaId: number, data: LeagueInvitationCreateRequest) {
    return this.http.post(`${environment.apiUrl}/invitacionliga/liga/${ligaId}`, data);
  }

  getInvitationsByLiga(ligaId: number) {
    return this.http.get(`${environment.apiUrl}/invitacionliga/liga/${ligaId}`);
  }

  cancelInvitation(invitacionId: number) {
    return this.http.delete(`${environment.apiUrl}/invitacionliga/${invitacionId}`);
  }

  respondInvitation(data: LeagueInvitationResponseRequest) {
    return this.http.post(`${environment.apiUrl}/invitacionliga/responder`, data);
  }

  getTorneosSelect() {
    return this.http.get<any[]>(`${environment.apiUrl}/torneo/select`);
  }

  getRankingGlobalUsuarios() {
    return this.http.get<any[]>(`${environment.apiUrl}/ranking/global/usuarios`);
  }

  getRankingGlobalLigas() {
    return this.http.get<any[]>(`${environment.apiUrl}/ranking/global/ligas`);
  }

  getPremiosLiga(ligaId: number) {
    return this.http.get<any[]>(`${environment.apiUrl}/ranking/premios/liga/${ligaId}`);
  }
}