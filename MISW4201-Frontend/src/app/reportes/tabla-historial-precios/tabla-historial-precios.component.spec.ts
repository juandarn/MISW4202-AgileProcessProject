import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TablaHistorialPreciosComponent } from './tabla-historial-precios.component';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IngredienteProveedorHistorial } from '../ingrediente-proveedor-historial';
import { By } from '@angular/platform-browser';
import { Ingrediente } from 'src/app/ingrediente/ingrediente';
import { Proveedor } from 'src/app/proveedor/proveedor';
import { ProveedorIngrediente } from 'src/app/proveedor-ingrediente/proveedor-ingrediente';
import { FormsModule } from '@angular/forms';

describe('TablaHistorialPreciosComponent', () => {
  let component: TablaHistorialPreciosComponent;
  let fixture: ComponentFixture<TablaHistorialPreciosComponent>;
  let toastr: ToastrService;

  const proveedor1 = new Proveedor(
    1,
    'Proveedor test 1',
    '123',
    '3001111111',
    'p1@test.com',
    'Calle 1',
    5
  );
  const proveedor2 = new Proveedor(
    2,
    'Proveedor test 2',
    '456',
    '3002222222',
    'p2@test.com',
    'Calle 2',
    4
  );

  const ingrediente1 = new Ingrediente(1, 'Harina', 2, proveedor1);
  const ingrediente2 = new Ingrediente(2, 'Huevos', 20, proveedor2);
  const ingrediente3 = new Ingrediente(3, 'Fresas', 4, proveedor2);

  const mockHistorial: IngredienteProveedorHistorial[] = [
    new IngredienteProveedorHistorial(
      '2025-09-05T05:22:31',
      '2',
      new ProveedorIngrediente(1, 2, 2, ingrediente1, proveedor1)
    ),
    new IngredienteProveedorHistorial(
      '2025-09-05T07:38:15',
      '20',
      new ProveedorIngrediente(2, 20, 20, ingrediente2, proveedor2)
    ),
    new IngredienteProveedorHistorial(
      '2025-09-05T19:16:13',
      '4',
      new ProveedorIngrediente(3, 4, 4, ingrediente3, proveedor2)
    ),
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TablaHistorialPreciosComponent],
      imports: [ToastrModule.forRoot(), HttpClientTestingModule, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TablaHistorialPreciosComponent);
    component = fixture.componentInstance;
    toastr = TestBed.inject(ToastrService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render spinner when loading', () => {
    component.spinner = true;
    fixture.detectChanges();
    const spinnerEl = fixture.debugElement.query(By.css('.spinner-border'));
    expect(spinnerEl).toBeTruthy();
  });

  it('should render table rows according to historialPaginado', () => {
    component.spinner = false;
    component.mostrarTabla = true;
    component.historialPaginado = mockHistorial;
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(3);
    expect(rows[0].nativeElement.textContent).toContain('Proveedor test 1');
    expect(rows[1].nativeElement.textContent).toContain('Proveedor test 2');
  });

  it('should display "No hay datos disponibles" when historialPaginado is empty', () => {
    component.spinner = false;
    component.mostrarTabla = true;
    component.historialPaginado = [];
    fixture.detectChanges();

    const noDataRow = fixture.debugElement.query(By.css('tbody tr td'));
    expect(noDataRow.nativeElement.textContent).toContain(
      'No hay datos disponibles'
    );
  });

  it('should filter rows based on textoBusqueda', () => {
    component.spinner = false;
    component.mostrarTabla = true;
    component.historialPrecios = mockHistorial;
    component.textoBusqueda = 'Fresas';
    component.actualizarTabla();
    fixture.detectChanges();

    expect(component.historialPaginado.length).toBe(1);
    expect(
      component.historialPaginado[0].ingrediente_proveedor.ingrediente.nombre
    ).toBe('Fresas');
  });

  it('should change page and update historialPaginado', () => {
    component.spinner = false;
    component.mostrarTabla = true;
    component.historialPrecios = [...mockHistorial, ...mockHistorial]; // 6 items
    component.tamanoPagina = 5;
    component.pagina = 1;
    component.actualizarTabla();

    component.cambiarPagina(2);
    expect(component.historialPaginado.length).toBe(1); // Segunda página solo tiene 1 elemento
  });

  it('should sort by precio ascending', () => {
    component.spinner = false;
    component.mostrarTabla = true;
    component.historialPrecios = [...mockHistorial];
    component.ordenarPor('precio');

    expect(component.historialPrecios[0].precio).toBe(2);
    expect(component.historialPrecios[2].precio).toBe(20);
  });

  it('should sort by precio descending', () => {
    component.spinner = false;
    component.mostrarTabla = true;
    component.historialPrecios = [...mockHistorial];
    component.ordenarPor('precio'); // asc
    component.ordenarPor('precio'); // toggle a desc

    expect(component.historialPrecios[0].precio).toBe(20);
    expect(component.historialPrecios[2].precio).toBe(2);
  });

  it('should sort by fecha ascending', () => {
    component.spinner = false;
    component.mostrarTabla = true;
    component.historialPrecios = [...mockHistorial];
    component.ordenarPor('fecha');

    expect(component.historialPrecios[0].fecha.getTime()).toBeLessThan(
      component.historialPrecios[2].fecha.getTime()
    );
  });

  it('should sort by fecha descending', () => {
    component.spinner = false;
    component.mostrarTabla = true;
    component.historialPrecios = [...mockHistorial];
    component.ordenarPor('fecha'); // asc
    component.ordenarPor('fecha'); // desc

    expect(component.historialPrecios[0].fecha.getTime()).toBeGreaterThan(
      component.historialPrecios[2].fecha.getTime()
    );
  });

  it('should sort by proveedor ascending', () => {
    component.spinner = false;
    component.mostrarTabla = true;
    component.historialPrecios = [...mockHistorial];
    component.ordenarPor('proveedor');

    expect(
      component.historialPrecios[0].ingrediente_proveedor.proveedor.nombre
    ).toBe('Proveedor test 1');
  });

  it('should sort by ingrediente ascending', () => {
    component.spinner = false;
    component.mostrarTabla = true;
    component.historialPrecios = [...mockHistorial];
    component.ordenarPor('ingrediente');

    expect(
      component.historialPrecios[0].ingrediente_proveedor.ingrediente.nombre
    ).toBe('Fresas');
  });
});
