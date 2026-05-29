import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../enviroments/enviroments';
import { PremiosGlobales } from '../interfaces/premios-globales.interface';
import { PremioDistribuido } from '../interfaces/premio-distribuido.interface';
import { TorneoSelect } from '../interfaces/torneo-select.interface';
import { PremioLiga } from '../../premio-liga/interfaces/premio-liga.interface';

@Injectable({ providedIn: 'root' })
export class PremiosService {
    private http = inject(HttpClient);
    private rankingUrl = `${environment.apiUrl}/ranking`;
    private torneoUrl = `${environment.apiUrl}/torneo`;
    private reporteUrl = `${environment.apiUrl}/reporte`;


    getPremiosGlobales(): Observable<PremiosGlobales> {
        return this.http.get<PremiosGlobales>(`${this.rankingUrl}/premios/globales`);
    }

    getTorneos(): Observable<TorneoSelect[]> {
        return this.http.get<TorneoSelect[]>(`${this.torneoUrl}/select`);
    }

    cerrarTorneo(torneoId: number): Observable<PremioDistribuido[]> {
        return this.http.post<PremioDistribuido[]>(
            `${this.rankingUrl}/premios/globales/cerrar/${torneoId}`,
            {}
        );
    }

    getHistorial(torneoId: number): Observable<PremioDistribuido[]> {
        return this.http.get<PremioDistribuido[]>(
            `${this.rankingUrl}/premios/globales/historial/${torneoId}`
        );
    }

    descargarPremios(torneoId: number): Observable<Blob> {
        return this.http.get(`${this.reporteUrl}/premios/descargar/${torneoId}`, {
            responseType: 'blob',
        });
    }
    getPremiosLiga(ligaId: number): Observable<PremioLiga[]> {
         return this.http.get<PremioLiga[]>(`${this.rankingUrl}/premios/liga/${ligaId}`);
    }
}