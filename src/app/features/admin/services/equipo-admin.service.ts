import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../enviroments/enviroments';

@Injectable({ providedIn: 'root' })
export class EquipoAdminService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/equipo`;

  getAll(page = 1, pageSize = 200) {
    return this.http.get<any[]>(`${this.base}?page=${page}&pageSize=${pageSize}`);
  }

  getById(id: number) {
    return this.http.get<any>(`${this.base}/${id}`);
  }

  getSelect() {
    return this.http.get<any[]>(`${this.base}/select`);
  }

  create(data: any) { return this.http.post<any>(this.base, data); }

  update(id: number, data: any) { return this.http.put<any>(`${this.base}/${id}`, data); }

  delete(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }
}