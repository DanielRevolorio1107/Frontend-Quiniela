export interface PremioDistribuido {
  id: number;
  torneoId: number;
  userId: number;
  fullName: string;
  ligaId: number | null;
  nombreLiga: string | null;
  concepto: string;
  monto: number;
  posicion: number;
  fechaDistribucion: string;
}