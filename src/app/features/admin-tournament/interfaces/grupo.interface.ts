export interface EquipoEnGrupo {
  id: number;
  nombre: string;
  codigoFifa: string;
  banderaUrl: string;
  entrenador: string;
  capitan: string;
}

export interface EquipoSelect {
  id: number;
  nombre: string;
  codigoFifa: string;
  banderaUrl: string;
}

export interface Grupo {
  id: number;
  nombre: string;
  torneoId: number;
  torneoNombre: string;
  equipos: EquipoEnGrupo[];
}

export interface GrupoCreate {
  nombre: string;
  torneoId: number;
}

export interface GrupoUpdate {
  nombre?: string;
}