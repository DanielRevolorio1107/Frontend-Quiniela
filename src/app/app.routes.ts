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

import { UserListComponent } from './features/admin-users/pages/user-list/user-list.component';
import { UserCreateComponent } from './features/admin-users/pages/user-create/user-create.component';
import { UserDetailComponent } from './features/admin-users/pages/user-detail/user-detail.component';
import { ReportesComponent } from './features/admin-reports/pages/reportes.component';
import { PremiosComponent } from './features/admin-premios/pages/premios.component';
import { TorneoListComponent } from './features/admin-tournament/pages/torneo-list/torneo-list.component';
import { TorneoFormComponent } from './features/admin-tournament/pages/torneo-form/torneo-form.component';
import { TorneoConfigComponent } from './features/admin-tournament/pages/torneo-config/torneo-config.component';






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

    // M7 - Panel de Administración
    { path: 'admin', redirectTo: 'admin/usuarios', pathMatch: 'full' },
    { path: 'admin/usuarios', component: UserListComponent, canActivate: [adminGuard] },
    { path: 'admin/usuarios/crear', component: UserCreateComponent, canActivate: [adminGuard] },
    { path: 'admin/usuarios/:id', component: UserDetailComponent, canActivate: [adminGuard] },
    { path: 'admin/reportes', component: ReportesComponent, canActivate: [adminGuard] },
    { path: 'admin/premios', component: PremiosComponent, canActivate: [adminGuard] },
    // M7 - Torneos
    { path: 'admin/torneo', component: TorneoListComponent, canActivate: [adminGuard] },
    { path: 'admin/torneo/crear', component: TorneoFormComponent, canActivate: [adminGuard] },
    { path: 'admin/torneo/:id/editar', component: TorneoFormComponent, canActivate: [adminGuard] },
    { path: 'admin/torneo/:id/configurar', component: TorneoConfigComponent, canActivate: [adminGuard] },





    { path: '**', redirectTo: 'login' },
];