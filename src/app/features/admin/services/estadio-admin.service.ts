import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../enviroments/enviroments';

@Injectable({ providedIn: 'root' })
export class EstadioAdminService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/estadio`;

  getAll(page = 1, pageSize = 100) {
    return this.http.get<any[]>(`${this.base}?page=${page}&pageSize=${pageSize}`);
  }

  getById(id: number) {
    return this.http.get<any>(`${this.base}/${id}`);
  }

  getSelect() {
    return this.http.get<any[]>(`${this.base}/select`);
  }

  create(data: { nombre: string; ciudad: string; pais: string; capacidad: number }) {
    return this.http.post<any>(this.base, data);
  }

  update(id: number, data: { nombre: string; ciudad: string; pais: string; capacidad: number }) {
    return this.http.put<any>(`${this.base}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}