import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../enviroments/enviroments';
import { PredictionCreateRequest } from '../../leagues/Interfaces/prediction-create-request.interface';
import { PredictionUpdateRequest } from '../../leagues/Interfaces/prediction-update-request.interface';

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getTorneosSelect() {
    return this.http.get<any[]>(`${this.apiUrl}/torneo/select`);
  }

  getPartidosByTorneo(torneoId: number) {
    return this.http.get(`${this.apiUrl}/partido/torneo/${torneoId}`);
  }

  getPartidosPendientes(torneoId: number) {
    return this.http.get(`${this.apiUrl}/partido/pendientes/${torneoId}`);
  }

  getPartidoById(id: number) {
    return this.http.get(`${this.apiUrl}/partido/${id}`);
  }

  verificarPrediccion(partidoId: number, ligaId: number) {
    return this.http.get<{ existe: boolean; prediccion?: any }>(
      `${this.apiUrl}/prediccion/verificar?partidoId=${partidoId}&ligaId=${ligaId}`
    );
  }

  getMisPredicciones(ligaId: number, page = 1, pageSize = 100) {
    return this.http.get(
      `${this.apiUrl}/prediccion/mis-predicciones/${ligaId}?page=${page}&pageSize=${pageSize}`
    );
  }

  getPrediccionesByLiga(ligaId: number, page = 1, pageSize = 20) {
    return this.http.get(
      `${this.apiUrl}/prediccion/liga/${ligaId}?page=${page}&pageSize=${pageSize}`
    );
  }

  getPrediccionById(id: number) {
    return this.http.get(`${this.apiUrl}/prediccion/${id}`);
  }

  createPrediccion(data: PredictionCreateRequest) {
    return this.http.post(`${this.apiUrl}/prediccion`, data);
  }

  updatePrediccion(id: number, data: PredictionUpdateRequest) {
    return this.http.put(`${this.apiUrl}/prediccion/${id}`, data);
  }
}