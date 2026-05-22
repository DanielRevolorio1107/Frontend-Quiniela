import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

import { BracketService } from '../../services/bracket.service';
import { SessionService } from '../../../../core/services/session.service';
import { Partido } from '../../interfaces/partido.interface';
import { GrupoConClasificacion } from '../../interfaces/grupo-clasificacion.interface';

@Component({
  selector: 'app-bracket',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bracket.component.html',
  styleUrl: './bracket.component.css',
})
export class BracketComponent implements OnInit {
  private bracketService = inject(BracketService);
  private sessionService = inject(SessionService);

  readonly TORNEO_ID = 1;

  partidos: Partido[] = [];
  grupos: GrupoConClasificacion[] = [];

  isLoading = true;
  errorMessage = '';
  isAdmin = false;

 // Borrar estas:
showResultModal = false;
resultPartido: Partido | null = null;
inputGolesLocal: number | null = null;
inputGolesVisitante: number | null = null;
fueAPenales = false;
penalesLocal: number | null = null;
penalesVisitante: number | null = null;
isSubmittingResult = false;
resultError = '';

  ngOnInit(): void {
    this.isAdmin = this.sessionService.getRole() === 'Administrador';
    this.loadAll();
  }

  loadAll(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      partidos: this.bracketService.getPartidos(this.TORNEO_ID),
      grupos: this.bracketService.getGrupos(this.TORNEO_ID),
    }).subscribe({
      next: ({ partidos, grupos }) => {
        this.partidos = partidos.sort((a, b) => a.id - b.id);

        const clasif$ = grupos
          .sort((a, b) => a.id - b.id)
          .map(g =>
            this.bracketService.getClasificacion(g.id).pipe(
              map(clasificacion => ({ ...g, clasificacion }))
            )
          );

        forkJoin(clasif$).subscribe({
          next: gruposClasif => {
            this.grupos = gruposClasif;
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
            this.errorMessage = 'No se pudieron cargar las clasificaciones.';
          }
        });
      },
      error: error => {
        this.isLoading = false;
        this.errorMessage = this.parseError(error, 'No se pudo cargar el torneo.');
      }
    });
  }


  get leftGroups(): GrupoConClasificacion[] { return this.grupos.slice(0, 6); }
  get rightGroups(): GrupoConClasificacion[] { return this.grupos.slice(6, 12); }


  private byFase(faseId: number): Partido[] {
    return this.partidos.filter(p => p.fase.id === faseId);
  }

  get leftR32Pairs(): [Partido, Partido][] {
  const r = this.byFase(2).slice(0, 8);
  const s = Array.from({ length: 8 }, (_, i) => (r[i] ?? null) as Partido);
  return [[s[0],s[1]], [s[2],s[3]], [s[4],s[5]], [s[6],s[7]]];
}

get rightR32Pairs(): [Partido, Partido][] {
  const r = this.byFase(2).slice(8, 16);
  const s = Array.from({ length: 8 }, (_, i) => (r[i] ?? null) as Partido);
  return [[s[0],s[1]], [s[2],s[3]], [s[4],s[5]], [s[6],s[7]]];
}

get leftR16Pairs(): [Partido, Partido][] {
  const r = this.byFase(3).slice(0, 4);
  const s = Array.from({ length: 4 }, (_, i) => (r[i] ?? null) as Partido);
  return [[s[0],s[1]], [s[2],s[3]]];
}

get rightR16Pairs(): [Partido, Partido][] {
  const r = this.byFase(3).slice(4, 8);
  const s = Array.from({ length: 4 }, (_, i) => (r[i] ?? null) as Partido);
  return [[s[0],s[1]], [s[2],s[3]]];
}

get leftQFPair(): [Partido, Partido] {
  const r = this.byFase(4).slice(0, 2);
  return [(r[0] ?? null) as Partido, (r[1] ?? null) as Partido];
}

get rightQFPair(): [Partido, Partido] {
  const r = this.byFase(4).slice(2, 4);
  return [(r[0] ?? null) as Partido, (r[1] ?? null) as Partido];
}

get leftSF(): Partido  { return (this.byFase(5)[0] ?? null) as Partido; }
get rightSF(): Partido { return (this.byFase(5)[1] ?? null) as Partido; }
get finalPartido(): Partido  { return (this.byFase(7)[0] ?? null) as Partido; }
get tercerPuesto(): Partido  { return (this.byFase(6)[0] ?? null) as Partido; }


  isWinner(p: Partido | null, lado: 'local' | 'visitante'): boolean {
    if (!p?.finalizado || p.golesLocal === null || p.golesVisitante === null) return false;
    return lado === 'local'
      ? p.golesLocal > p.golesVisitante
      : p.golesVisitante > p.golesLocal;
  }







  private parseError(error: any, fallback: string): string {
    if (error.status === 0) return 'No se pudo conectar con el servidor.';
    if (error.status === 403) return 'No tienes permisos.';
    return error?.error?.error || error?.error?.message || fallback;
  }
}