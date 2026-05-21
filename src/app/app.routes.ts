import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

import { LoginComponent } from './features/auth/pages/login/login.component';
import { RegisterComponent } from './features/auth/pages/register/register.component';
import { ProfileComponent } from './features/auth/pages/profile/profile.component';
import { ForgotPasswordComponent } from './features/auth/pages/forgot-password/forgot-password.component';
import { RecoverPasswordComponent } from './features/auth/pages/recover-password/recover-password.component';

import { LeagueListComponent } from './features/leagues/pages/league-list/league-list.component';
import { LeagueCreateComponent } from './features/leagues/pages/league-create/league-create.component';
import { LeagueDetailComponent } from './features/leagues/pages/league-detail/league-detail.component';
import { LeagueSearchComponent } from './features/leagues/pages/league-search/league-search.component';
import { InvitationResponseComponent } from './features/leagues/pages/invitation-response/invitation-response.component';

import { MyPredictionsComponent } from './features/predictions/pages/my-predictions/my-predictions.component';
import { PredictionFormComponent } from './features/predictions/pages/prediction-form/prediction-form.component';
import { MatchListComponent } from './features/predictions/pages/match-list/match-list.component';
import { PredictionEditComponent } from './features/predictions/pages/prediction-edit/prediction-edit.component';

import { AdminMatchResultsComponent } from './features/admin/pages/admin-match-results/admin-match-results.component';
import { UserListComponent } from './features/admin-users/pages/user-list/user-list.component';
import { UserCreateComponent } from './features/admin-users/pages/user-create/user-create.component';
import { UserDetailComponent } from './features/admin-users/pages/user-detail/user-detail.component';
import { ReportesComponent } from './features/admin-reports/pages/reportes.component';
import { PremiosComponent } from './features/admin-premios/pages/premios.component';
import { TorneoListComponent } from './features/admin-tournament/pages/torneo-list/torneo-list.component';
import { TorneoFormComponent } from './features/admin-tournament/pages/torneo-form/torneo-form.component';
import { TorneoConfigComponent } from './features/admin-tournament/pages/torneo-config/torneo-config.component';

import { BracketComponent } from './features/bracket/pages/bracket/bracket.component';
import { AdminDashboardComponent } from './features/admin/pages/admin-dashboard/admin-dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Auth
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'recuperar-password', component: RecoverPasswordComponent },

  // Ligas
  { path: 'ligas', component: LeagueListComponent, canActivate: [authGuard] },
  { path: 'ligas/crear', component: LeagueCreateComponent, canActivate: [authGuard] },
  { path: 'ligas/buscar', component: LeagueSearchComponent, canActivate: [authGuard] },
  { path: 'ligas/:id', component: LeagueDetailComponent, canActivate: [authGuard] },
  { path: 'invitacion/responder', component: InvitationResponseComponent },

  // Partidos y Predicciones
  { path: 'partidos', component: MatchListComponent, canActivate: [authGuard] },
  { path: 'predicciones/nueva/:partidoId', component: PredictionFormComponent, canActivate: [authGuard] },
  { path: 'predicciones/mias', component: MyPredictionsComponent, canActivate: [authGuard] },
  { path: 'predicciones/editar/:id', component: PredictionEditComponent, canActivate: [authGuard] },

  // Bracket para todos los usuarios logueados
  { path: 'bracket', component: BracketComponent, canActivate: [authGuard] },

  // Admin sistema
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'admin/partidos', component: AdminMatchResultsComponent, canActivate: [adminGuard] },
  { path: 'admin/usuarios', component: UserListComponent, canActivate: [adminGuard] },
  { path: 'admin/usuarios/crear', component: UserCreateComponent, canActivate: [adminGuard] },
  { path: 'admin/usuarios/:id', component: UserDetailComponent, canActivate: [adminGuard] },
  { path: 'admin/reportes', component: ReportesComponent, canActivate: [adminGuard] },
  { path: 'admin/premios', component: PremiosComponent, canActivate: [adminGuard] },

  // Admin torneos
  { path: 'admin/torneo', component: TorneoListComponent, canActivate: [adminGuard] },
  { path: 'admin/torneo/crear', component: TorneoFormComponent, canActivate: [adminGuard] },
  { path: 'admin/torneo/:id/editar', component: TorneoFormComponent, canActivate: [adminGuard] },
  { path: 'admin/torneo/:id/configurar', component: TorneoConfigComponent, canActivate: [adminGuard] },

  { path: '**', redirectTo: 'login' }
];