export interface RankingGlobalUsuario {
  posicion: number;
  userId: number;
  fullName: string;
  totalPuntos: number;
  premioAsignado: number | null;
}

export interface RankingGlobalLiga {
  posicion: number;
  ligaId: number;
  nombreLiga: string;
  promedioPuntos: number;
  totalMiembros: number;
  premioTotal: number | null;
  premioPerCapita: number | null;
}

export interface PremiosGlobales {
  totalRecaudadoGlobal: number;
  montoGlobalIndividual: number;
  montoGlobalLiga: number;
  topIndividuales: RankingGlobalUsuario[];
  mejorLiga: RankingGlobalLiga | null;
}