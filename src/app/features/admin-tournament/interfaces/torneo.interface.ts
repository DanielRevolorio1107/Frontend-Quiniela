export interface Torneo {
  id: number;
  nombre: string;
  año: number;
  paisSede: string;
  fechaInicio: string;
  fechaFin: string;
  createdAt: string;
}

export interface TorneoSelect {
  id: number;
  nombre: string;
}

export interface TorneoCreate {
  nombre: string;
  año: number;
  paisSede: string;
  fechaInicio: string;
  fechaFin: string;
}

export interface TorneoUpdate {
  nombre?: string;
  paisSede?: string;
  fechaInicio?: string;
  fechaFin?: string;
}