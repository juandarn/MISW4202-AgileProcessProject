import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Restaurante } from './restaurante';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RestauranteService {
  private apiUrl = environment.apiUrl;

  private restauranteActual = new BehaviorSubject<Restaurante | null>(null);
  restauranteActual$ = this.restauranteActual.asObservable();

  constructor(private http: HttpClient) {}

  // --- CRUD ---
  darRestaurantes(): Observable<Restaurante[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${sessionStorage.getItem('token')}`,
    });
    return this.http.get<Restaurante[]>(`${this.apiUrl}/restaurantes`, {
      headers,
    });
  }

  crearRestaurante(formData: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${sessionStorage.getItem('token')}`,
    });
    return this.http.post<any>(`${this.apiUrl}/restaurantes`, formData, {
      headers,
    });
  }

  darRestaurante(idRestaurante: number): Observable<Restaurante> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${sessionStorage.getItem('token')}`,
    });
    return this.http.get<Restaurante>(
      `${this.apiUrl}/restaurante/${idRestaurante}`,
      { headers }
    );
  }

  editarRestaurante(id: number, formData: FormData) {
    return this.http.put(`${this.apiUrl}/restaurante/${id}`, formData);
  }

  eliminarRestaurante(idRestaurante: number): Observable<Restaurante> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${sessionStorage.getItem('token')}`,
    });
    return this.http.delete<Restaurante>(
      `${this.apiUrl}/restaurante/${idRestaurante}`,
      { headers }
    );
  }

  actualizarChefsRestaurante(
    idRestaurante: number,
    chefIds: number[]
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${sessionStorage.getItem('token')}`,
    });
    return this.http.put(
      `${this.apiUrl}/restaurantes/${idRestaurante}/chefs`,
      {
        chef_ids: chefIds,
      },
      { headers }
    );
  }

  asignarRecetaARestaurante(restauranteId: number, recetaId: number) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${sessionStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    });
    return this.http.post(
      `${this.apiUrl}/restaurantes/${restauranteId}/recetas-asignadas`,
      { receta_id: recetaId },
      { headers }
    );
  }

  // --- Manejo del restaurante actual ---
  setRestauranteActual(restaurante: Restaurante): void {
    this.restauranteActual.next(restaurante);
  }
}
