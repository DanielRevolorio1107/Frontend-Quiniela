import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../enviroments/enviroments';
import { ReporteResumen } from '../interfaces/reporte-resumen.interface';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reporte`;

  getResumen(): Observable<ReporteResumen> {
    return this.http.get<ReporteResumen>(`${this.apiUrl}/resumen`);
  }

  descargarUsuarios(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/usuarios/descargar`, {
      responseType: 'blob',
    });
  }

  descargarLigas(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/ligas/descargar`, {
      responseType: 'blob',
    });
  }
}