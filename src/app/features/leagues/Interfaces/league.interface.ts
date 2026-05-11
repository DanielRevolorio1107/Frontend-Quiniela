export interface League {
  id: number;
  nombre: string;
  descripcion?: string;
  tipo: string;
  precioEntrada?: number;
  esPrivada?: boolean;
  creadorId?: number;
}