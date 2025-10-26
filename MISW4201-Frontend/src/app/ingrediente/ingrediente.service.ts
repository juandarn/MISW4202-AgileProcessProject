import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment'
import { Ingrediente } from './ingrediente';

@Injectable({
  providedIn: 'root'
})
export class IngredienteService {

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) { }

  darIngredientes(): Observable<Ingrediente[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`
    })
    return this.http.get<Ingrediente[]>(`${this.apiUrl}/ingredientes`, { headers: headers })
  }

  darIngrediente(idIngrediente: number): Observable<Ingrediente> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`
    })
    return this.http.get<Ingrediente>(`${this.apiUrl}/ingrediente/${idIngrediente}`, { headers: headers })
  }

  crearIngrediente(ingrediente: Ingrediente): Observable<Ingrediente> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`
    })
    return this.http.post<Ingrediente>(`${this.apiUrl}/ingredientes`, ingrediente, { headers: headers })
  }

  editarIngrediente(ingrediente: Ingrediente): Observable<Ingrediente> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`
    })
    return this.http.put<Ingrediente>(`${this.apiUrl}/ingrediente/${ingrediente.id}`, ingrediente, { headers: headers })
  }

  borrarIngrediente(idIngrediente: number): Observable<Ingrediente> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`
    })
    return this.http.delete<Ingrediente>(`${this.apiUrl}/ingrediente/${idIngrediente}`, { headers: headers })
  }

}
