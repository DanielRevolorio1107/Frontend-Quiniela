export interface EquipoEnPartido {
  id: number;
  nombre: string;
  codigoFifa: string;
  banderaUrl: string;
}

export interface FaseInfo {
  id: number;
  nombre: string;
  orden: number;
}

export interface EstadioInfo {
  nombre: string;
  ciudad: string;
}

export interface Partido {
  id: number;
  torneoId: number;
  fase: FaseInfo;
  grupoId: number | null;
  grupoNombre: string | null;
  equipoLocal: EquipoEnPartido | null;
  equipoVisitante: EquipoEnPartido | null;
  descripcionLocal: string | null;
  descripcionVisitante: string | null;
  fechaHora: string;
  estadio: EstadioInfo;
  golesLocal: number | null;
  golesVisitante: number | null;
  golesLocalPenales: number | null;     
  golesVisitantePenales: number | null;
  finalizado: boolean;
}

export interface PartidoUpdate {
  equipoLocalId: number | null;
  equipoVisitanteId: number | null;
  fechaHora: string;
  estadioId: number | null;
}

export interface ResultadoRequest {
  golesLocal: number;
  golesVisitante: number;
}

export interface EquipoSelect {
  id: number;
  nombre: string;
  codigoFifa: string;
  banderaUrl: string;
}

export interface EstadioSelect {
  id: number;
  nombre: string;
  ciudad: string;
}