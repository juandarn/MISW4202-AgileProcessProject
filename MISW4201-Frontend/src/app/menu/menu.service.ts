// src/app/menu/menu.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`
    });
  }

  darMenus(restauranteId: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/restaurantes/${restauranteId}/menus`,
      { headers: this.authHeaders() }
    );
  }

  darMenu(restauranteId: number, menuId: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/restaurantes/${restauranteId}/menu/${menuId}`,
      { headers: this.authHeaders() }
    );
  }

  crearMenuConFoto(restauranteId: number, formData: FormData): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/restaurantes/${restauranteId}/menus`,
      formData,
      { headers: this.authHeaders() }
    );
  }

  editarMenu(restauranteId: number, menuId: number, formData: FormData): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/restaurantes/${restauranteId}/menu/${menuId}`,
      formData,
      { headers: this.authHeaders() }
    );
  }

  borrarMenu(restauranteId: number, menuId: number): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/restaurantes/${restauranteId}/menu/${menuId}`,
      { headers: this.authHeaders() }
    );
  }

  reporteCompra(restauranteId: number, menuId: number): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/restaurantes/${restauranteId}/reporte-compra/${menuId}`,
      { headers: this.authHeaders() }
    );
  }
}
