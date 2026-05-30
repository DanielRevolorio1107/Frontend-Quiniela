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
import { RankingGlobalComponent } from './features/leagues/pages/ranking-global/ranking-global.component';

import { MyPredictionsComponent } from './features/predictions/pages/my-predictions/my-predictions.component';
import { PredictionFormComponent } from './features/predictions/pages/prediction-form/prediction-form.component';
import { MatchListComponent } from './features/predictions/pages/match-list/match-list.component';
import { PredictionEditComponent } from './features/predictions/pages/prediction-edit/prediction-edit.component';

import { DashboardComponent } from './features/dashboard/pages/dashboard/dashboard.component';

import { AdminMatchResultsComponent } from './features/admin/pages/admin-match-results/admin-match-results.component';
import { EstadioListComponent } from './features/admin/pages/estadio-list/estadio-list.component';
import { EstadioFormComponent } from './features/admin/pages/estadio-form/estadio-form.component';
import { EquipoListComponent } from './features/admin/pages/equipo-list/equipo-list.component';
import { EquipoFormComponent } from './features/admin/pages/equipo-form/equipo-form.component';
import { PartidoListComponent } from './features/admin/pages/partido-list/partido-list.component';
import { PartidoFormComponent } from './features/admin/pages/partido-form/partido-form.component';

import { UserListComponent } from './features/admin-users/pages/user-list/user-list.component';
import { UserCreateComponent } from './features/admin-users/pages/user-create/user-create.component';
import { UserDetailComponent } from './features/admin-users/pages/user-detail/user-detail.component';

import { ReportesComponent } from './features/admin-reports/pages/reportes.component';
import { PremiosComponent } from './features/admin-premios/pages/premios.component';

import { TorneoListComponent } from './features/admin-tournament/pages/torneo-list/torneo-list.component';
import { TorneoFormComponent } from './features/admin-tournament/pages/torneo-form/torneo-form.component';
import { TorneoConfigComponent } from './features/admin-tournament/pages/torneo-config/torneo-config.component';
import { LigaPremiosComponent } from './features/premio-liga/pages/liga-premios.component';
import { GithubCallbackComponent } from './features/auth/pages/github-callback/github-callback.component';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },

    // Auth
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'recuperar-password', component: RecoverPasswordComponent },
    { path: 'auth/github/callback', component: GithubCallbackComponent },

    // Dashboard
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },

    // Ligas
    { path: 'ligas', component: LeagueListComponent, canActivate: [authGuard] },
    { path: 'ligas/crear', component: LeagueCreateComponent, canActivate: [authGuard] },
    { path: 'ligas/buscar', component: LeagueSearchComponent, canActivate: [authGuard] },
    { path: 'ligas/:id', component: LeagueDetailComponent, canActivate: [authGuard] },
    { path: 'invitacion/responder', component: InvitationResponseComponent },
    { path: 'ranking', component: RankingGlobalComponent, canActivate: [authGuard] },

    // Partidos y Predicciones
    { path: 'partidos', component: MatchListComponent, canActivate: [authGuard] },
    { path: 'predicciones/nueva/:partidoId', component: PredictionFormComponent, canActivate: [authGuard] },
    { path: 'predicciones/mias', component: MyPredictionsComponent, canActivate: [authGuard] },
    { path: 'predicciones/editar/:id', component: PredictionEditComponent, canActivate: [authGuard] },

    // Admin — Estadios
    { path: 'admin/estadios', component: EstadioListComponent, canActivate: [adminGuard] },
    { path: 'admin/estadios/crear', component: EstadioFormComponent, canActivate: [adminGuard] },
    { path: 'admin/estadios/:id/editar', component: EstadioFormComponent, canActivate: [adminGuard] },

    // Admin — Equipos
    { path: 'admin/equipos', component: EquipoListComponent, canActivate: [adminGuard] },
    { path: 'admin/equipos/crear', component: EquipoFormComponent, canActivate: [adminGuard] },
    { path: 'admin/equipos/:id/editar', component: EquipoFormComponent, canActivate: [adminGuard] },

    // Admin — Usuarios
    { path: 'admin/usuarios', component: UserListComponent, canActivate: [adminGuard] },
    { path: 'admin/usuarios/crear', component: UserCreateComponent, canActivate: [adminGuard] },
    { path: 'admin/usuarios/:id', component: UserDetailComponent, canActivate: [adminGuard] },

    // Admin — Reportes y Premios
    { path: 'admin/reportes', component: ReportesComponent, canActivate: [adminGuard] },
    { path: 'admin/premios', component: PremiosComponent, canActivate: [adminGuard] },

    // Admin — Torneos
    { path: 'admin/torneo', component: TorneoListComponent, canActivate: [adminGuard] },
    { path: 'admin/torneo/crear', component: TorneoFormComponent, canActivate: [adminGuard] },
    { path: 'admin/torneo/:id/editar', component: TorneoFormComponent, canActivate: [adminGuard] },
    { path: 'admin/torneo/:id/configurar', component: TorneoConfigComponent, canActivate: [adminGuard] },

    // Admin — Partidos
    { path: 'admin/partidos', component: PartidoListComponent, canActivate: [adminGuard] },
    { path: 'admin/partidos/crear', component: PartidoFormComponent, canActivate: [adminGuard] },
    { path: 'admin/partidos/resultados', component: AdminMatchResultsComponent, canActivate: [adminGuard] },
    { path: 'admin/partidos/:id/editar', component: PartidoFormComponent, canActivate: [adminGuard] },

    //premio-liga
    { path: 'ligas/:id/premios', component: LigaPremiosComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: 'login' }
];