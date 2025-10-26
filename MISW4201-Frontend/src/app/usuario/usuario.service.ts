import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Usuario } from './usuario';
import { environment } from '../../environments/environment';
import { Perfil } from './perfil';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(usuario: string, contrasena: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, {
      usuario: usuario,
      contrasena: contrasena,
    });
  }

  registro(nuevoUsuario: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signin`, nuevoUsuario);
  }

  darPerfil(idPerfil: string): Observable<Perfil> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${sessionStorage.getItem('token')}`,
    });
    return this.http.get<Perfil>(`${this.apiUrl}/perfil/${idPerfil}`, {
      headers: headers,
    });
  }

  actualizarPerfil(idPerfil: string, perfil: Perfil): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${sessionStorage.getItem('token')}`,
    });
    return this.http.put(`${this.apiUrl}/perfil/${idPerfil}`, perfil, {
      headers: headers,
    });
  }
}
