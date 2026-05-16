import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ApiResponse } from '../interfaces/ApiResponse.Interface';
import { LoginRequest, AuthResponse, PasswordChangeRequest } from '../interfaces/Auth.Interface';
import { UsuarioResponse, UsuarioRequest } from '../interfaces/Usuario.Interface';
import { environment } from '../../environments/environment';

/**
 * Servicio encargado de la gestión de usuarios y autenticación.
 * Proporciona métodos para el ciclo de vida del usuario (CRUD) y el control de sesiones.
 */
@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) { }

  /**
   * Realiza la autenticación del usuario.
   * Si el login es exitoso, almacena el token JWT en el almacenamiento local.
   * @param credentials Objeto con email y password.
   * @returns Observable con la respuesta de la API que contiene el token y datos de sesión.
   */
  login(credentials: LoginRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res?.data?.token) {
          localStorage.setItem('token', res.data.token);
        }
      })
    );
  }

  /**
   * Registra un nuevo usuario en el sistema.
   * @param formData Datos del usuario (soporta envío de archivos como fotos de perfil).
   * @returns Observable con los datos del usuario registrado y su token inicial.
   */
  crearUsuario(formData: FormData): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, formData);
  }

  /**
   * Realiza una carga masiva de usuarios.
   * Envía un array de objetos.
   * @param usuarios Array de objetos con la información de los usuarios a crear.
   * @returns Observable con la respuesta de la API.
   */
  crearVariosUsuarios(usuarios: any[]): Observable<ApiResponse<UsuarioResponse[]>> {
    return this.http.post<ApiResponse<UsuarioResponse[]>>(`${this.apiUrl}/masivo`, usuarios);
  }

  /**
   * Obtiene la lista completa de usuarios registrados.
   * @returns Observable con un array de UsuarioResponse.
   */
  listar(): Observable<ApiResponse<UsuarioResponse[]>> {
    return this.http.get<ApiResponse<UsuarioResponse[]>>(this.apiUrl);
  }


  /**
   * Obtiene el listado completo de ALUMNOS para el panel de administración.
   * Este método ignora el filtro de 'activos' del backend para permitir 
   * la gestión y reactivación de usuarios pausados.
   * @returns Observable con la lista total de alumnos (0 y 1).
   */
  listarAlumnosAdmin(): Observable<ApiResponse<UsuarioResponse[]>> {
    return this.http.get<ApiResponse<UsuarioResponse[]>>(`${this.apiUrl}/admin/alumnos`);
  }

  /**
     * Obtiene una lista de usuarios filtrados por su identificador de rol.
     * @param idRol ID del rol por el cual filtrar.
     * @returns Observable con la respuesta de la API que contiene el array de usuarios.
     */
  listarPorRol(idRol: number): Observable<ApiResponse<UsuarioResponse[]>> {
    return this.http.get<ApiResponse<UsuarioResponse[]>>(`${this.apiUrl}/rol/${idRol}`);
  }




  /**
   * Obtiene los usuarios inscritos o relacionados con un taller específico.
   * @param idTaller Identificador único del taller.
   * @returns Observable con la lista de usuarios del taller.
   */
  listarPorTaller(idTaller: number): Observable<ApiResponse<UsuarioResponse[]>> {
    return this.http.get<ApiResponse<UsuarioResponse[]>>(`${this.apiUrl}/taller/${idTaller}`);
  }

  /**
   * Busca un usuario por su identificador único.
   * @param id ID del usuario.
   * @returns Observable con la información detallada del usuario.
   */
  obtenerPorId(id: number): Observable<ApiResponse<UsuarioResponse>> {
    return this.http.get<ApiResponse<UsuarioResponse>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Busca un usuario a través de su dirección de correo electrónico.
   * @param email Email del usuario a consultar.
   * @returns Observable con la información del usuario.
   */
  obtenerPorEmail(email: string): Observable<ApiResponse<UsuarioResponse>> {
    return this.http.get<ApiResponse<UsuarioResponse>>(`${this.apiUrl}/email/${email}`);
  }

  /**
   * Actualiza los datos de un usuario existente.
   * @param id ID del usuario a modificar.
   * @param formData Nuevos datos del usuario (permite actualizar imagen de perfil).
   * @returns Observable con el usuario actualizado.
   */
  actualizarUsuario(id: number, formData: FormData): Observable<ApiResponse<UsuarioResponse>> {
    return this.http.put<ApiResponse<UsuarioResponse>>(`${this.apiUrl}/${id}`, formData);
  }

  /**
   * Elimina un usuario de la base de datos de forma permanente.
   * @param id ID del usuario a eliminar.
   * @returns Observable de confirmación de la operación.
   */
  eliminar(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Envía una solicitud para iniciar el proceso de recuperación de contraseña.
   * @param email Correo del usuario.
   * @returns Observable con la respuesta de la operación.
   */
  solicitarRecuperacion(email: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/password-reset-request`, { email });
  }

  /**
   * Envía el token y la nueva contraseña para finalizar el restablecimiento.
   * @param datos Objeto con el token y la nueva password.
   * @returns Observable con la respuesta de la operación.
   */
  restablecerPassword(datos: PasswordChangeRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/password-reset-confirm`, datos);
  }

  /**
   * Cierra la sesión del usuario actual eliminando todos los datos del localStorage.
   */
  logout(): void {
    localStorage.clear();
  }
}