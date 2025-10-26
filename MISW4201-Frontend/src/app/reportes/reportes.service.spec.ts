import { TestBed } from '@angular/core/testing';
import { ReportesService } from './reportes.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { IngredienteProveedorHistorial } from './ingrediente-proveedor-historial';
import { ProveedorIngrediente } from '../proveedor-ingrediente/proveedor-ingrediente';
import { environment } from '../../environments/environment';
import { Ingrediente } from '../ingrediente/ingrediente';
import { Proveedor } from '../proveedor/proveedor';

describe('ReportesService', () => {
  let service: ReportesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReportesService],
    });

    service = TestBed.inject(ReportesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // -----------------------------
  // darHistorialPrecios
  // -----------------------------
  it('should fetch historial precios correctly', () => {
    const mockResponse: IngredienteProveedorHistorial[] = [
      {
        fecha: new Date('2025-09-05'),
        precio: 10,
        ingrediente_proveedor: null,
      },
    ];

    service.darHistorialPrecios().subscribe((res) => {
      expect(res.length).toBe(1);
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/reporte-historial-precios`
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(
      `Bearer ${sessionStorage.getItem('token')}`
    );
    req.flush(mockResponse);
  });

  it('should handle error response for historial precios', () => {
    service.darHistorialPrecios().subscribe({
      next: () => fail('should have failed with 500 error'),
      error: (error) => {
        expect(error.status).toBe(500);
      },
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/reporte-historial-precios`
    );
    req.flush('Error interno', { status: 500, statusText: 'Server Error' });
  });

  // -----------------------------
  // darIngredientesProveedores
  // -----------------------------
  it('should fetch ingredientes proveedores correctly', () => {
    const proveedor = new Proveedor(
      1,
      'Proveedor test',
      '123',
      '3001111111',
      'p@test.com',
      'Calle 1',
      5
    );
    const ingrediente = new Ingrediente(1, 'Harina', 10, proveedor);

    const mockResponse: ProveedorIngrediente[] = [
      new ProveedorIngrediente(1, 10, 10, ingrediente, proveedor), 
    ];

    service.darIngredientesProveedores().subscribe((res) => {
      expect(res.length).toBe(1);
      expect(res[0].precio).toBe(10);
      expect(res[0].ingrediente.nombre).toBe('Harina');
      expect(res[0].proveedor.nombre).toBe('Proveedor test');
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/reporte-ingrediente-proveedor`
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(
      `Bearer ${sessionStorage.getItem('token')}`
    );
    req.flush(mockResponse);
  });

  it('should handle error response for ingredientes proveedores', () => {
    service.darIngredientesProveedores().subscribe({
      next: () => fail('should have failed with 500 error'),
      error: (error) => {
        expect(error.status).toBe(500);
      },
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/reporte-ingrediente-proveedor`
    );
    req.flush('Error interno', { status: 500, statusText: 'Server Error' });
  });
});
