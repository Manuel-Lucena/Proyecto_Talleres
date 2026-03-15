import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class TokenService {

  private get getTokenFromStorage(): string | null {
    return localStorage.getItem('token');
  }

  decode(): any {
    const token = this.getTokenFromStorage;
    if (!token) return null;
    try {
      return jwtDecode<any>(token);
    } catch (error) {
      console.error('Error decodificando el token:', error);
      return null;
    }
  }

  getId(): number | null {
    const decoded = this.decode();
    return decoded?.id || null;
  }


  getEmail(): string | null {
    const decoded = this.decode();
    return decoded?.sub || null;
  }

  getRol(): string | null {
    const decoded = this.decode();
    return decoded?.role || decoded?.rol || null; 
  }

  isLogged(): boolean {
    const dec = this.decode();
    if (!dec) return false;
    return (dec.exp * 1000) > Date.now();
  }

  logOut(): void {
    localStorage.removeItem('token');
  }
}