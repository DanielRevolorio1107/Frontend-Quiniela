export interface Match {
  id: number;
  equipoLocal: string;
  equipoVisitante: string;
  fechaHora: string;
  estado?: string;
  fase?: string;
  grupo?: string;
}