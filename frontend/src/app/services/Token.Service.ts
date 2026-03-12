import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class TokenService {

  // 1. Este método lee el string raro del LocalStorage
  private get getTokenFromStorage(): string | null {
    return localStorage.getItem('token');
  }

  // 2. Este método lo traduce a algo que entendemos
  decode(): any {
    const token = this.getTokenFromStorage;
    if (!token) return null;

    try {
      const decoded = jwtDecode<any>(token);
      return decoded;
    } catch (error) {
      console.error('Error decodificando el token:', error);
      return null;
    }
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