import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ApiResponse } from '../interfaces/ApiResponse.Interface';
import { LoginRequest, AuthResponse } from '../interfaces/Auth.Interface';
import { UsuarioResponse, UsuarioRequest } from '../interfaces/Usuario.Interface';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiUrl = 'http://localhost:8080/api/usuarios';

  constructor(private http: HttpClient) { }

  // 1. LOGIN
  login(credentials: LoginRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res?.data?.token) {
          localStorage.setItem('token', res.data.token);
        }
      })
    );
  }

  // 2. CREAR USUARIO (Recibe el FormData directamente del componente)
  crearUsuario(formData: FormData): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, formData);
  }
  // 3. LISTAR
  listar(): Observable<ApiResponse<UsuarioResponse[]>> {
    return this.http.get<ApiResponse<UsuarioResponse[]>>(this.apiUrl);
  }

  // 4. OBTENER POR ID
  obtenerPorId(id: number): Observable<ApiResponse<UsuarioResponse>> {
    return this.http.get<ApiResponse<UsuarioResponse>>(`${this.apiUrl}/${id}`);
  }

  // OBTENER POR EMAIL
  obtenerPorEmail(email: string): Observable<ApiResponse<UsuarioResponse>> {
    return this.http.get<ApiResponse<UsuarioResponse>>(`${this.apiUrl}/email/${email}`);
  }

  // 5. ACTUALIZAR 
  
  actualizarUsuario(id: number, formData: FormData): Observable<ApiResponse<UsuarioResponse>> {
    return this.http.put<ApiResponse<UsuarioResponse>>(`${this.apiUrl}/${id}`, formData);
  }

  // 6. ELIMINAR
  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  logout(): void {
    localStorage.clear();
  }
}