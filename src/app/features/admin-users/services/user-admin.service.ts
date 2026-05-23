import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../enviroments/enviroments';
import { User } from '../interfaces/user.interface';
import { CreateUserRequest } from '../interfaces/create-user-request.interface';
import { UpdateUserRequest } from '../interfaces/update-user-request.interface';
import { UpdateUserRoleRequest } from '../interfaces/update-user-role-request.interface';
import { UpdateUserPasswordRequest } from '../interfaces/update-user-password-request.interface';
import { MessageResponse } from '../../auth/interfaces/message-response.interface';
import { Role } from '../interfaces/role.interface';


@Injectable({ providedIn: 'root' })
export class UserAdminService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/usuario`;

  getAll(page = 1, pageSize = 10): Observable<User[]> {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    return this.http.get<User[]>(this.apiUrl, { params });
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, data);
  }

  update(id: number, data: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, data);
  }

  //  devuelve el User actualizado
  updateRole(id: number, data: UpdateUserRoleRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/rol`, data);
  }

  updatePassword(id: number, data: UpdateUserPasswordRequest): Observable<MessageResponse> {
    return this.http.put<MessageResponse>(`${this.apiUrl}/${id}/password`, data);
  }

  //  204 No Content
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/roles`);
  }
}