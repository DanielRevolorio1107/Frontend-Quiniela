export interface Fase {
  id: number;
  nombre: string;
  orden: number;
  torneoId: number;
  torneoNombre: string;
}

export interface FaseCreate {
  nombre: string;
  orden: number;
  torneoId: number;
}

export interface FaseUpdate {
  nombre?: string;
  orden?: number;
}