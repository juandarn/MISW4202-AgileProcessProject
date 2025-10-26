import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Chef } from './chef';

@Injectable({
  providedIn: 'root'
})
export class ChefService {

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) { }

  darChefs(): Observable<Chef[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`
    });
    return this.http.get<Chef[]>(`${this.apiUrl}/chefs`, { headers: headers });
  }

  darChef(idChef: number): Observable<Chef> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`
    });
    return this.http.get<Chef>(`${this.apiUrl}/chef/${idChef}`, { headers: headers });
  }

  crearChef(chef: Chef): Observable<Chef> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`
    });
    return this.http.post<Chef>(`${this.apiUrl}/chefs`, chef, { headers: headers });
  }

  editarChef(chef: Chef): Observable<Chef> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`
    });
    return this.http.put<Chef>(`${this.apiUrl}/chef/${chef.id}`, chef, { headers: headers });
  }

  borrarChef(idChef: number): Observable<Chef> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`
    });
    return this.http.delete<Chef>(`${this.apiUrl}/chef/${idChef}`, { headers: headers });
  }

}
