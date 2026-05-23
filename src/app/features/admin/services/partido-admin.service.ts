import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../enviroments/enviroments';

@Injectable({ providedIn: 'root' })
export class PartidoAdminService {
    private http = inject(HttpClient);
    private base = `${environment.apiUrl}/partido`;

    getAll(page = 1, pageSize = 50) {
        return this.http.get<any[]>(`${this.base}?page=${page}&pageSize=${pageSize}`);
    }

    getById(id: number) {
        return this.http.get<any>(`${this.base}/${id}`);
    }

    getByTorneo(torneoId: number) {
        return this.http.get<any[]>(`${this.base}/torneo/${torneoId}`);
    }

    getByFase(faseId: number) {
        return this.http.get<any[]>(`${this.base}/fase/${faseId}`);
    }

    getByGrupo(grupoId: number) {
        return this.http.get<any[]>(`${this.base}/grupo/${grupoId}`);
    }

    getPendientes(torneoId: number) {
        return this.http.get<any[]>(`${this.base}/pendientes/${torneoId}`);
    }

    actualizarMarcador(id: number, data: { golesLocal: number; golesVisitante: number }) {
        return this.http.put<any>(`${this.base}/${id}/marcador`, data);
    }

    ingresarResultado(id: number, data: { golesLocal: number; golesVisitante: number }) {
        return this.http.put<any>(`${this.base}/${id}/resultado`, data);
    }

    create(data: any) {
        return this.http.post<any>(this.base, data);
    }

    update(id: number, data: any) {
        return this.http.put<any>(`${this.base}/${id}`, data);
    }

    delete(id: number) {
        return this.http.delete<void>(`${this.base}/${id}`);
    }

    getGruposByTorneo(torneoId: number) {
        return this.http.get<any[]>(`${environment.apiUrl}/grupo/torneo/${torneoId}`);
    }

    getEquiposSelect() {
        return this.http.get<any[]>(`${environment.apiUrl}/equipo/select`);
    }

    getEstadiosSelect() {
        return this.http.get<any[]>(`${environment.apiUrl}/estadio/select`);
    }

    getTorneosSelect() {
        return this.http.get<any[]>(`${environment.apiUrl}/torneo/select`);
    }
    getMejoresTerceros(torneoId: number) {
        return this.http.get<any[]>(`${environment.apiUrl}/grupo/torneo/${torneoId}/mejores-terceros`);
    }
}