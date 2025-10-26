import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Receta } from './receta';

@Injectable({
  providedIn: 'root'
})
export class RecetaService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // === Helpers ===
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`
    });
  }

  private getUserId(): string {
    const id = sessionStorage.getItem('idUsuario');
    if (!id) throw new Error('No hay usuario en sesión');
    return id;
  }

  private getRestauranteId(restauranteId?: number | string): string {
    const id = restauranteId ?? sessionStorage.getItem('restauranteId');
    if (id === null || id === undefined || id === '') {
      throw new Error('No hay restaurante seleccionado');
    }
    return String(id);
  }

  // === Recetas ===

  // GET /restaurantes/:restauranteId/recetas/:idUsuario
  darRecetas(restauranteId?: number): Observable<Receta[]> {
    const rid = this.getRestauranteId(restauranteId);
    const headers = this.getHeaders();
    return this.http.get<Receta[]>(
      `${this.apiUrl}/restaurantes/${rid}/recetas`,
      { headers }
    );
  }

  // GET /restaurantes/:restauranteId/receta/:idReceta
  darReceta(idReceta: number, restauranteId?: number): Observable<Receta> {
    const rid = this.getRestauranteId(restauranteId);
    const headers = this.getHeaders();
    return this.http.get<Receta>(
      `${this.apiUrl}/restaurantes/${rid}/receta/${idReceta}`,
      { headers }
    );
  }

  // POST /restaurantes/:restauranteId/recetas
  crearReceta(receta: Receta, restauranteId?: number): Observable<Receta> {
    const uid = this.getUserId();
    const rid = this.getRestauranteId(restauranteId);
    const headers = this.getHeaders();
    return this.http.post<Receta>(
      `${this.apiUrl}/restaurantes/${rid}/recetas`,
      receta,
      { headers }
    );
  }

  // PUT /restaurantes/:restauranteId/receta/:id
  editarReceta(receta: Receta, restauranteId?: number): Observable<Receta> {
    const rid = this.getRestauranteId(restauranteId);
    const headers = this.getHeaders();
    return this.http.put<Receta>(
      `${this.apiUrl}/restaurantes/${rid}/receta/${receta.id}`,
      receta,
      { headers }
    );
  }

  // DELETE /restaurantes/:restauranteId/receta/:idReceta
  borrarReceta(idReceta: number, restauranteId?: number): Observable<void> {
    const rid = this.getRestauranteId(restauranteId);
    const headers = this.getHeaders();
    return this.http.delete<void>(
      `${this.apiUrl}/restaurantes/${rid}/receta/${idReceta}`,
      { headers }
    );
  }
}
