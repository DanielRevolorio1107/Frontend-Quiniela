import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { RegisterComponent } from './features/auth/pages/register/register.component';
import { authGuard } from './core/guards/auth.guard';
import { ProfileComponent } from './features/auth/pages/profile/profile.component';
import { ForgotPasswordComponent } from './features/auth/pages/forgot-password/forgot-password.component';
import { RecoverPasswordComponent } from './features/auth/pages/recover-password/recover-password.component';
import { LeagueListComponent } from './features/leagues/pages/league-list/league-list.component';
import { LeagueCreateComponent } from './features/leagues/pages/league-create/league-create.component';
import { LeagueDetailComponent } from './features/leagues/pages/league-detail/league-detail.component';
import { LeagueSearchComponent } from './features/leagues/pages/league-search/league-search.component';
import { InvitationResponseComponent } from './features/leagues/pages/invitation-response/invitation-response.component';

export const routes: Routes = [
    {path: '', redirectTo: 'login', pathMatch: 'full'},
    {path: 'login', component: LoginComponent},
    {path: 'register', component: RegisterComponent},
    {path: 'profile', component: ProfileComponent , canActivate: [authGuard]},
    {path: 'forgot-password', component: ForgotPasswordComponent},
    { path: 'recuperar-password', component: RecoverPasswordComponent },
    { path: 'ligas', component: LeagueListComponent, canActivate: [authGuard] },
    { path: 'ligas/crear', component: LeagueCreateComponent, canActivate: [authGuard] },
    { path: 'ligas/buscar', component: LeagueSearchComponent, canActivate: [authGuard] },
    { path: 'ligas/:id', component: LeagueDetailComponent, canActivate: [authGuard] },
    { path: 'invitacion/responder', component: InvitationResponseComponent },
    {path: '**', redirectTo: 'login'},
];
