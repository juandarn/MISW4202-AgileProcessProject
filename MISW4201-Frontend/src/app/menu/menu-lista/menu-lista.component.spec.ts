import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MenuService } from '../menu.service';
import { Menu } from '../menu';
import { MenuListaComponent } from './menu-lista.component';
import { Component } from '@angular/core';
import { TablaAppModule } from 'src/app/tabla-app/tabla-app.module';

@Component({ selector: 'app-encabezado', template: '' })
class EncabezadoStubComponent {}

describe('MenuListaComponent', () => {
  let component: MenuListaComponent;
  let fixture: ComponentFixture<MenuListaComponent>;
  let mockMenuService: jasmine.SpyObj<MenuService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let activatedRouteStub: any;

  const RID = 2; // restauranteId simulado que el componente debe leer

  beforeEach(async () => {
    mockMenuService = jasmine.createSpyObj('MenuService', ['darMenus', 'borrarMenu']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    // Stub de ActivatedRoute con parent.snapshot.paramMap.get('id') => '2'
    activatedRouteStub = {
      parent: {
        snapshot: {
          paramMap: {
            get: (key: string) => (key === 'id' ? String(RID) : null),
          },
        },
      },
    };

    await TestBed.configureTestingModule({
      declarations: [MenuListaComponent, EncabezadoStubComponent],
      imports: [TablaAppModule],
      providers: [
        { provide: MenuService, useValue: mockMenuService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuListaComponent);
    component = fixture.componentInstance;
  });

  it('debería crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('debería cargar los menús en la inicialización', () => {
      const mockMenus: Menu[] = [{ id: 1, nombre: 'Menú Test' } as Menu];
      mockMenuService.darMenus.and.returnValue(of({ menus: mockMenus }));

      component.ngOnInit();

      expect(mockMenuService.darMenus).toHaveBeenCalledWith(RID);
      expect(component.menus).toEqual(mockMenus);
    });

    it('debería manejar error al cargar menús', () => {
      spyOn(console, 'error');
      mockMenuService.darMenus.and.returnValue(throwError(() => 'Error al cargar'));

      component.ngOnInit();

      expect(console.error).toHaveBeenCalledWith('❌ Error al cargar los menús', 'Error al cargar');
      expect(component.menus).toEqual([]);
    });
  });

  describe('manejarAccion', () => {
    it('debería navegar a crear menú', () => {
      component['restauranteIdCtx'] = RID; // por si el test necesita setearlo explícitamente
      component.manejarAccion({ accion: 'crear', datos: {} });
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/restaurantes', RID, 'menu', 'crear']);
    });

    it('debería navegar a editar menú', () => {
      component['restauranteIdCtx'] = RID;
      component.manejarAccion({ accion: 'editar', datos: { id: 5 } });
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/restaurantes', RID, 'menu', 'editar', 5]);
    });

    it('debería seleccionar un menú al eliminar', () => {
      component['restauranteIdCtx'] = RID;   // ← agrega esto
      const menu = { id: 3 } as Menu;
      component.manejarAccion({ accion: 'eliminar', datos: menu });
      expect(component.menuSeleccionado).toBe(menu); // toBe funciona porque es la misma referencia
      // Si prefieres, también podría ser: expect(component.menuSeleccionado).toEqual(menu);
    });


    it('debería navegar a detalle de menú', () => {
      component['restauranteIdCtx'] = RID;
      component.manejarAccion({ accion: 'detalle', datos: { id: 7 } });
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/restaurantes', RID, 'menu', 'detalle', 7]);
    });
  });

  describe('confirmarEliminar', () => {
    it('debería borrar el menú seleccionado y recargar la lista', () => {
      const menu = { id: 1 } as Menu;
      component['restauranteIdCtx'] = RID;
      component.menuSeleccionado = menu;

      mockMenuService.borrarMenu.and.returnValue(of({}));
      mockMenuService.darMenus.and.returnValue(of({ menus: [] }));

      component.confirmarEliminar();

      expect(mockMenuService.borrarMenu).toHaveBeenCalledWith(RID, 1);
      expect(mockMenuService.darMenus).toHaveBeenCalledWith(RID);
    });

    it('debería manejar error al borrar menú', () => {
      spyOn(console, 'error');
      const menu = { id: 1 } as Menu;
      component['restauranteIdCtx'] = RID;
      component.menuSeleccionado = menu;

      mockMenuService.borrarMenu.and.returnValue(throwError(() => 'Error al eliminar'));

      component.confirmarEliminar();

      expect(console.error).toHaveBeenCalledWith('❌ Error al eliminar el menú', 'Error al eliminar');
    });

    it('no debería hacer nada si no hay menú seleccionado', () => {
      component.menuSeleccionado = null;
      component.confirmarEliminar();

      expect(mockMenuService.borrarMenu).not.toHaveBeenCalled();
    });
  });
});
