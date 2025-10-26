import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IngredienteProveedorHistorial } from './ingrediente-proveedor-historial';
import { ProveedorIngrediente } from '../proveedor-ingrediente/proveedor-ingrediente';
import { ReporteCompra } from './reporte-compra.model';

@Injectable({
  providedIn: 'root',
})
export class ReportesService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${sessionStorage.getItem('token')}`,
    });
  }

  darHistorialPrecios(): Observable<IngredienteProveedorHistorial[]> {
    return this.http.get<IngredienteProveedorHistorial[]>(
      `${this.apiUrl}/reporte-historial-precios`,
      { headers: this.headers() }
    );
  }

  darIngredientesProveedores(): Observable<ProveedorIngrediente[]> {
    return this.http.get<ProveedorIngrediente[]>(
      `${this.apiUrl}/reporte-ingrediente-proveedor`,
      { headers: this.headers() }
    );
  }

  
  darReporteCompra(restauranteId: number, idMenu: number): Observable<ReporteCompra> {
    return this.http.get<ReporteCompra>(
      `${this.apiUrl}/restaurantes/${restauranteId}/reporte-compra/${idMenu}`,
      { headers: this.headers() }
    );
  }
}
