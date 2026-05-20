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

  getPartidosPendientes(torneoId: number) {
    return this.http.get(`${this.apiUrl}/partido/pendientes/${torneoId}`);
  }

  getPartidoById(id: number) {
    return this.http.get(`${this.apiUrl}/partido/${id}`);
  }

  getMisPredicciones(ligaId: number, page = 1, pageSize = 10) {
    return this.http.get(
      `${this.apiUrl}/prediccion/mis-predicciones/${ligaId}?page=${page}&pageSize=${pageSize}`
    );
  }

  getPrediccionesByLiga(ligaId: number, page = 1, pageSize = 10) {
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