import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment'
import { Proveedor } from './proveedor';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) { }

  darProveedores(): Observable<Proveedor[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`
    });
    return this.http.get<Proveedor[]>(`${this.apiUrl}/proveedores`, { headers: headers });
  }

  darProveedor(idProveedor: number): Observable<Proveedor> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`
    });
    return this.http.get<Proveedor>(`${this.apiUrl}/proveedor/${idProveedor}`, { headers: headers });
  }

  crearProveedor(proveedor: Proveedor): Observable<Proveedor> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`
    })
    return this.http.post<Proveedor>(`${this.apiUrl}/proveedores`, proveedor, { headers: headers })
  }

  editarProveedor(proveedor: Proveedor): Observable<Proveedor> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`
    });
    return this.http.put<Proveedor>(`${this.apiUrl}/proveedor/${proveedor.id}`, proveedor, { headers: headers });
  }

  borrarProveedor(idProveedor: number): Observable<Proveedor> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`
    });
    return this.http.delete<Proveedor>(`${this.apiUrl}/proveedor/${idProveedor}`, { headers: headers })
  }

}
