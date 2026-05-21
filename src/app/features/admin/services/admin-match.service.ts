import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../enviroments/enviroments';


@Injectable({
  providedIn: 'root'
})
export class AdminMatchService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAllPartidos(page = 1, pageSize = 100) {
    return this.http.get(`${this.apiUrl}/partido?page=${page}&pageSize=${pageSize}`);
  }

  ingresarResultado(partidoId: number, data: { golesLocal: number; golesVisitante: number }) {
    return this.http.put(`${this.apiUrl}/partido/${partidoId}/resultado`, data);
  }
}