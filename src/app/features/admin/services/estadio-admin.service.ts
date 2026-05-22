import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../enviroments/enviroments';

@Injectable({
  providedIn: 'root'
})
export class EstadioAdminService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAll(page = 1, pageSize = 50) {
    return this.http.get(`${this.apiUrl}/estadio?page=${page}&pageSize=${pageSize}`);
  }

  getById(id: number) {
    return this.http.get(`${this.apiUrl}/estadio/${id}`);
  }

  getSelect() {
    return this.http.get(`${this.apiUrl}/estadio/select`);
  }

  create(data: {
    nombre: string;
    ciudad: string;
    pais: string;
    capacidad: number;
  }) {
    return this.http.post(`${this.apiUrl}/estadio`, data);
  }

  update(id: number, data: {
    nombre?: string;
    ciudad?: string;
    pais?: string;
    capacidad?: number;
  }) {
    return this.http.put(`${this.apiUrl}/estadio/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/estadio/${id}`);
  }
}