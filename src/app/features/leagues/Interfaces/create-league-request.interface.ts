export interface CreateLeagueRequest {
  nombre: string;
  esDeApuestas: boolean;
  precioPorUnirse?: number | null;
  torneoId: number;
  nombreEquipo: string;
}