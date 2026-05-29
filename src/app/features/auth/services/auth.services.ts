import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


import { LoginRequest } from '../interfaces/login-request.interface';
import { LoginResponse } from '../interfaces/login-response.interface';
import { RegisterRequest } from '../interfaces/register-request.interface';
import { environment } from '../../../../enviroments/enviroments';
import { RegisterResponse } from '../interfaces/register-response.interface';
import { ForgotPasswordRequest } from '../interfaces/forgot-password-request.interface';
import { MessageResponse } from '../interfaces/message-response.interface';
import { RecoverPasswordRequest } from '../interfaces/recover-password-request.interface';


@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    login(data: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, data);
    }

    register(data: RegisterRequest): Observable<RegisterResponse> {
        return this.http.post<RegisterResponse>(`${this.apiUrl}/auth/register`, data);
    }

    getMe() {
        return this.http.get(`${this.apiUrl}/auth/perfil`);
    }

   forgotPassword(data: ForgotPasswordRequest) {
        return this.http.post<MessageResponse>(`${this.apiUrl}/auth/contraseña-olvidada`, data);
    }


    recoverPassword(data: RecoverPasswordRequest) {
        return this.http.post<MessageResponse>(`${this.apiUrl}/auth/recuperar-contraseña`, data);
    }

    logoutApi() {
        return this.http.post(`${this.apiUrl}/auth/logout`, {});
    }

    changeOwnPassword(userId: number, newPassword: string) {
        return this.http.put(`${this.apiUrl}/auth/reset/${userId}`, { newPassword });
    }
}
