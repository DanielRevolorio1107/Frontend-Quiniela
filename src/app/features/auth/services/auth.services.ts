import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


import { LoginRequest } from '../interfaces/login-request.interface';
import { LoginResponse } from '../interfaces/login-response.interface';
import { RegisterRequest } from '../interfaces/register-request.interface';
import { environment } from '../../../../enviroments/enviroments';
import { RegisterResponse } from '../interfaces/register-response.interface';


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

    getMe(){
        return this.http.get(`${this.apiUrl}/auth/me`);
    }
}