import { Component, ElementRef } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';

import { MenuEditarComponent } from './menu-editar.component';
import { MenuService } from '../menu.service';
import { RecetaService } from 'src/app/receta/receta.service';
import { Receta } from 'src/app/receta/receta';
import { Toast } from 'bootstrap';

@Component({ selector: 'app-encabezado', template: '' })
class EncabezadoStubComponent {}

describe('MenuEditarComponent', () => {
  let component: MenuEditarComponent;
  let fixture: ComponentFixture<MenuEditarComponent>;
  let mockMenuService: jasmine.SpyObj<MenuService>;
  let mockRecetaService: jasmine.SpyObj<RecetaService>;
  let router: Router;

  const RID = 2;
  const MID = 10;

  beforeEach(async () => {
    mockMenuService = jasmine.createSpyObj('MenuService', ['darMenu', 'editarMenu']);
    mockRecetaService = jasmine.createSpyObj('RecetaService', ['darRecetas']);

    const mockActivatedRoute = {
      parent: { snapshot: { paramMap: new Map([['id', String(RID)]]) } },
      snapshot: { paramMap: new Map([['mid', String(MID)]]) }
    };

    await TestBed.configureTestingModule({
      declarations: [MenuEditarComponent, EncabezadoStubComponent],
      imports: [ReactiveFormsModule, RouterTestingModule],
      providers: [
        FormBuilder,
        { provide: MenuService, useValue: mockMenuService },
        { provide: RecetaService, useValue: mockRecetaService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuEditarComponent);
    component = fixture.componentInstance;

    component.successToast = new ElementRef(document.createElement('div'));

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
  });

  // ... (resto de tests iguales)

  describe('guardarCambios', () => {
    it('debería mostrar error si el formulario es inválido', () => {
      component.guardarCambios();
      expect(component.errorMessage).toBe('Por favor complete todos los campos obligatorios.');
      expect(mockMenuService.editarMenu).not.toHaveBeenCalled();
    });

    it('debería guardar cambios correctamente y redirigir', fakeAsync(() => {
      (component as any).restauranteIdCtx = RID;
      component.idMenu = MID;

      component.menuForm.patchValue({
        nombre: 'Menu Guardado',
        fechainicio: '2023-01-01',
        fechafin: '2023-01-07',
        descripcion: 'Desc'
      });

      mockMenuService.editarMenu.and.returnValue(of({}));

      // 🔇 Anula el Toast para que no programe timers internos
      spyOn(Toast.prototype as any, 'show').and.callFake(() => {});

      component.guardarCambios();

      // Avanza el setTimeout(900) del componente
      tick(950);

      expect(component.errorMessage).toBeNull();
      expect(mockMenuService.editarMenu).toHaveBeenCalledWith(
        RID,
        MID,
        jasmine.any(FormData)
      );
      expect(router.navigate).toHaveBeenCalledWith(['/restaurantes', RID, 'menus']);

      // 🔚 Por si quedara algún timer colgado de libs externas
      discardPeriodicTasks();
    }));

    it('debería manejar error al guardar cambios', () => {
      (component as any).restauranteIdCtx = RID;
      component.idMenu = MID;

      component.menuForm.patchValue({
        nombre: 'Menu Guardado',
        fechainicio: '2023-01-01',
        fechafin: '2023-01-07',
        descripcion: 'Desc'
      });

      mockMenuService.editarMenu.and.returnValue(
        throwError(() => ({ error: { mensaje: 'Error API' } }))
      );

      component.guardarCambios();

      expect(component.errorMessage).toBe('Error API');
    });
  });
});
