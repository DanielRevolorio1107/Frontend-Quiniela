import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../enviroments/enviroments';

@Injectable({
  providedIn: 'root'
})
export class EquipoAdminService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAll(page = 1, pageSize = 100) {
    return this.http.get(`${this.apiUrl}/equipo?page=${page}&pageSize=${pageSize}`);
  }

  getById(id: number) {
    return this.http.get(`${this.apiUrl}/equipo/${id}`);
  }

  getSelect() {
    return this.http.get(`${this.apiUrl}/equipo/select`);
  }

  create(data: {
    nombre: string;
    codigoFifa: string;
    banderaUrl: string;
    entrenador: string;
    capitan: string;
  }) {
    return this.http.post(`${this.apiUrl}/equipo`, data);
  }

  update(id: number, data: {
    nombre?: string;
    codigoFifa?: string;
    banderaUrl?: string;
    entrenador?: string;
    capitan?: string;
  }) {
    return this.http.put(`${this.apiUrl}/equipo/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/equipo/${id}`);
  }
}