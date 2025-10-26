// src/app/menu/menu.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MenuService } from './menu.service';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

describe('MenuService', () => {
  let service: MenuService;
  let httpMock: HttpTestingController;

  const RID = 2; // restauranteId usado en las pruebas

  beforeEach(() => {
    sessionStorage.setItem('token', 'FAKE_TOKEN');
    sessionStorage.setItem('idUsuario', '123');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MenuService]
    });

    service = TestBed.inject(MenuService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    sessionStorage.clear();
  });

  const expectedHeaders = new HttpHeaders({
    Authorization: 'Bearer FAKE_TOKEN'
  });

  it('debería crearse el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('darMenus debería hacer GET a /restaurantes/:rid/menus con headers', () => {
    service.darMenus(RID).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/restaurantes/${RID}/menus`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(expectedHeaders.get('Authorization'));
    req.flush({ menus: [] });
  });

  it('crearMenuConFoto debería hacer POST a /restaurantes/:rid/menus con FormData y headers', () => {
    const formData = new FormData();
    formData.append('nombre', 'Menú Test');

    service.crearMenuConFoto(RID, formData).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/restaurantes/${RID}/menus`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    expect(req.request.headers.get('Authorization')).toBe(expectedHeaders.get('Authorization'));
    req.flush({});
  });

  it('darMenu debería hacer GET a /restaurantes/:rid/menu/:id con headers', () => {
    service.darMenu(RID, 10).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/restaurantes/${RID}/menu/10`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(expectedHeaders.get('Authorization'));
    req.flush({ id: 10, nombre: 'Test' });
  });

  it('editarMenu debería hacer PUT a /restaurantes/:rid/menu/:id con FormData y headers', () => {
    const formData = new FormData();
    formData.append('nombre', 'Editado');

    service.editarMenu(RID, 5, formData).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/restaurantes/${RID}/menu/5`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body instanceof FormData).toBeTrue();
    expect(req.request.headers.get('Authorization')).toBe(expectedHeaders.get('Authorization'));
    req.flush({});
  });

  it('borrarMenu debería hacer DELETE a /restaurantes/:rid/menu/:id con headers', () => {
    service.borrarMenu(RID, 8).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/restaurantes/${RID}/menu/8`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('Authorization')).toBe(expectedHeaders.get('Authorization'));
    req.flush({});
  });

  it('reporteCompra debería hacer GET a /restaurantes/:rid/reporte-compra/:mid con headers', () => {
    service.reporteCompra(RID, 11).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/restaurantes/${RID}/reporte-compra/11`);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe(expectedHeaders.get('Authorization'));
    req.flush({ total: 0, recetas: [] });
  });
});
