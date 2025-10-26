// src/app/menu/menu-crear/menu-crear.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { MenuCrearComponent } from './menu-crear.component';
import { MenuService } from '../menu.service';
import { RecetaService } from 'src/app/receta/receta.service';

// Usa un stub simple del encabezado para evitar dependencias extras
import { Component } from '@angular/core';
@Component({ selector: 'app-encabezado', template: '' })
class EncabezadoStubComponent {}

import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';

describe('MenuCrearComponent', () => {
  let component: MenuCrearComponent;
  let fixture: ComponentFixture<MenuCrearComponent>;
  let mockMenuService: jasmine.SpyObj<MenuService>;
  let mockRecetaService: jasmine.SpyObj<RecetaService>;

  beforeEach(async () => {
    mockMenuService = jasmine.createSpyObj('MenuService', ['crearMenuConFoto']);
    mockRecetaService = jasmine.createSpyObj('RecetaService', ['darRecetas']);

    // 🔧 Mock de ActivatedRoute con parent/:id para que ngOnInit no haga return
    const mockActivatedRoute = {
      parent: { snapshot: { paramMap: new Map([['id', '123']]) } }
    };

    await TestBed.configureTestingModule({
      declarations: [MenuCrearComponent, EncabezadoStubComponent],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule,
        RouterTestingModule // provee Router/ActivatedRoute infra
      ],
      providers: [
        { provide: MenuService, useValue: mockMenuService },
        { provide: RecetaService, useValue: mockRecetaService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuCrearComponent);
    component = fixture.componentInstance;

    mockRecetaService.darRecetas.and.returnValue(of([
      { id: 1, nombre: 'Receta 1', porcion: 2, preparacion: 'Desc 1', ingredientes: [], duracion: 30 } as any,
      { id: 2, nombre: 'Receta 2', porcion: 4, preparacion: 'Desc 2', ingredientes: [], duracion: 45 } as any
    ]));

    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar recetas disponibles', () => {
    expect(component.recetasDisponibles.length).toBe(2);
    expect(component.recetasDisponibles[0].nombre).toBe('Receta 1');
  });

  it('debería agregar una receta al FormArray', () => {
    const recetasIniciales = component.recetas.length;
    component.agregarReceta();
    expect(component.recetas.length).toBe(recetasIniciales + 1);
  });

  it('debería eliminar una receta del FormArray', () => {
    component.agregarReceta();
    const recetasIniciales = component.recetas.length;
    component.eliminarReceta(0);
    expect(component.recetas.length).toBe(recetasIniciales - 1);
  });

  it('debería resetear el formulario al cancelar', () => {
    component.menuForm.patchValue({
      nombre: 'Test',
      fechainicio: '2025-09-05',
      fechafin: '2025-09-10',
      descripcion: 'Descripción test'
    });
    component.imagenPreview = 'algo';
    component.archivoSeleccionado = new File(['dummy'], 'test.png');
    component.errorMessage = 'Error';

    component.cancelar();

    expect(component.menuForm.get('nombre')?.value).toBeNull();
    expect(component.imagenPreview).toBeNull();
    expect(component.archivoSeleccionado).toBeNull();
    expect(component.errorMessage).toBeNull();
  });

  it('debería mostrar mensaje de error si el formulario es inválido al agregar', () => {
    component.menuForm.reset();
    component.agregar();
    expect(component.errorMessage).toBe('Por favor complete todos los campos obligatorios.');
  });

  it('debería manejar error en el servicio al agregar()', () => {
    component.menuForm.patchValue({
      nombre: 'Menú Error',
      fechainicio: '2025-09-05',
      fechafin: '2025-09-10',
      descripcion: 'Descripción'
    });
    component.recetas.at(0).patchValue({ idReceta: 1, personas: 2 });

    mockMenuService.crearMenuConFoto.and.returnValue(
      throwError(() => ({ error: { mensaje: 'Error del backend' } }))
    );

    component.agregar();

    expect(component.errorMessage).toBe('Error del backend');
  });
});
