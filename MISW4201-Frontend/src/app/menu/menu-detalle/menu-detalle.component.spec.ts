// src/app/menu/menu-detalle/menu-detalle.component.spec.ts
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { MenuDetalleComponent } from './menu-detalle.component';
import { MenuService } from '../menu.service';
import { RecetaService } from 'src/app/receta/receta.service';
import { Receta } from 'src/app/receta/receta';
import { TablaAppModule } from 'src/app/tabla-app/tabla-app.module';

@Component({ selector: 'app-encabezado', template: '' })
class MockEncabezadoComponent {}

describe('MenuDetalleComponent', () => {
  let component: MenuDetalleComponent;
  let fixture: ComponentFixture<MenuDetalleComponent>;
  let mockMenuService: jasmine.SpyObj<MenuService>;
  let mockRecetaService: jasmine.SpyObj<RecetaService>;
  let mockRouter: jasmine.SpyObj<Router>;

  // IDs que el componente espera encontrar en la ruta
  const RID = 5;   // restauranteId (viene del parent :id)
  const MID = 27;  // menuId (viene del snapshot actual :mid)

  // ParamMap muy simple (solo necesitamos .get)
  const makeParamMap = (obj: Record<string, string>) => ({
    get: (k: string) => obj[k]
  } as any);

  beforeEach(async () => {
    mockMenuService = jasmine.createSpyObj('MenuService', ['darMenu']);
    mockRecetaService = jasmine.createSpyObj('RecetaService', ['darRecetas']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    const mockActivatedRoute = {
      parent: { snapshot: { paramMap: makeParamMap({ id: String(RID) }) } },
      snapshot: { paramMap: makeParamMap({ mid: String(MID) }) }
    };

    await TestBed.configureTestingModule({
      declarations: [MenuDetalleComponent, MockEncabezadoComponent],
      imports: [ReactiveFormsModule, TablaAppModule],
      providers: [
        FormBuilder,
        { provide: MenuService, useValue: mockMenuService },
        { provide: RecetaService, useValue: mockRecetaService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuDetalleComponent);
    component = fixture.componentInstance;
  });

  it('debería crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar recetas disponibles en ngOnInit', () => {
    const recetasMock: Receta[] = [{ id: 1, nombre: 'Pizza' } as Receta];

    mockRecetaService.darRecetas.and.returnValue(of(recetasMock));
    // devolver un menú minimal para que no falle el get
    mockMenuService.darMenu.and.returnValue(of({ menu: { autor: { nombre: '' }, recetas: [] } }));

    component.ngOnInit();

    expect(mockRecetaService.darRecetas).toHaveBeenCalledWith(RID);
    expect(component.recetasDisponibles.length).toBe(1);
    expect(component.recetasDisponibles[0]).toEqual(recetasMock[0]);
  });

  it('debería manejar error al cargar el menú', () => {
    mockRecetaService.darRecetas.and.returnValue(of([]));
    mockMenuService.darMenu.and.returnValue(throwError(() => 'error'));

    component.ngOnInit();

    expect(component.errorMessage).toBe('No se pudo cargar el menú.');
  });

  it('debería cargar datos del menú en el formulario', () => {
    const menuMock = {
      nombre: 'Menú Semana',
      fechainicio: '2023-01-01',
      fechafin: '2023-01-07',
      descripcion: 'Descripción',
      autor: { nombre: 'Chef' },
      recetas: [{ id: 1, personas: 4 }],
      foto: 'fakeBase64'
    };

    mockRecetaService.darRecetas.and.returnValue(of([]));
    mockMenuService.darMenu.and.returnValue(of({ menu: menuMock }));

    component.ngOnInit();

    expect(component.menuForm.value.nombre).toBe('Menú Semana');
    expect(component.imagenPreview).toContain('data:image/png;base64,');
    expect(component.recetas.length).toBe(1);
  });

  it('debería preparar datos de recetas para tabla', () => {
    component.recetasDisponibles = [{ id: 1, nombre: 'Pizza' } as Receta];
    component.recetas.push(
      component['fb'].group({ idReceta: [1], personas: [2] })
    );

    component.prepararDatosDeRecetasParaTabla();

    expect(component.recetasParaTabla.length).toBe(1);
    expect(component.recetasParaTabla[0].nombreReceta).toBe('Pizza');
  });

  it('debería navegar al editar menú cuando manejarAccionReceta recibe "crear"', () => {
    // Asegura contexto
    (component as any).restauranteIdCtx = RID;
    component.idMenu = MID;

    component.manejarAccionReceta({ accion: 'crear', datos: {} });

    expect(mockRouter.navigate).toHaveBeenCalledWith([
      '/restaurantes', RID, 'menu', 'editar', MID
    ]);
  });

  it('debería devolver "Receta desconocida" si no encuentra la receta', () => {
    component.recetasDisponibles = [];
    expect(component.obtenerNombreReceta(99)).toBe('Receta desconocida');
  });
});
