export interface ClasificacionRow {
  equipo: {
    id: number;
    nombre: string;
    codigoFifa: string;
    banderaUrl: string;
    entrenador: string;
    capitan: string;
  };
  partidosJugados: number;
  ganados: number;
  empatados: number;
  perdidos: number;
  golesAFavor: number;
  golesEnContra: number;
  diferenciaGoles: number;
  puntos: number;
}

export interface GrupoBase {
  id: number;
  nombre: string;
  torneoId: number;
  torneoNombre: string;
  equipos: any[];
}

export interface GrupoConClasificacion extends GrupoBase {
  clasificacion: ClasificacionRow[];
}