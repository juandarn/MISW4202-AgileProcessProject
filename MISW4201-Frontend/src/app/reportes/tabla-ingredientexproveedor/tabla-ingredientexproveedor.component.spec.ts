import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TablaIngredientexproveedorComponent } from './tabla-ingredientexproveedor.component';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProveedorIngrediente } from 'src/app/proveedor-ingrediente/proveedor-ingrediente';
import { Ingrediente } from 'src/app/ingrediente/ingrediente';
import { Proveedor } from 'src/app/proveedor/proveedor';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('TablaIngredientexproveedorComponent', () => {
  let component: TablaIngredientexproveedorComponent;
  let fixture: ComponentFixture<TablaIngredientexproveedorComponent>;
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

  // Ingredientes (sin unidad, solo id, nombre, cantidad, proveedor)
  const ingrediente1 = new Ingrediente(1, 'Harina', 10, proveedor1);
  const ingrediente2 = new Ingrediente(2, 'Huevos', 20, proveedor2);
  const ingrediente3 = new Ingrediente(3, 'Fresas', 5, proveedor2);

  // ProveedorIngrediente (id, precio, cantidad, ingrediente, proveedor)
  const mockIngredientesProveedores: ProveedorIngrediente[] = [
    new ProveedorIngrediente(1, 10, 10, ingrediente1, proveedor1),
    new ProveedorIngrediente(2, 20, 20, ingrediente2, proveedor2),
    new ProveedorIngrediente(3, 5, 5, ingrediente3, proveedor2),
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TablaIngredientexproveedorComponent],
      imports: [ToastrModule.forRoot(), HttpClientTestingModule, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TablaIngredientexproveedorComponent);
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

  it('should render table rows according to ingredientesProveedoresPaginado', () => {
    component.spinner = false;
    component.mostrarTabla = true;
    component.ingredientesProveedoresPaginado = mockIngredientesProveedores;
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(3);
    expect(rows[0].nativeElement.textContent).toContain('Proveedor test 1');
    expect(rows[1].nativeElement.textContent).toContain('Proveedor test 2');
  });

  it('should display "No hay datos disponibles" when ingredientesProveedoresPaginado is empty', () => {
    component.spinner = false;
    component.mostrarTabla = true;
    component.ingredientesProveedoresPaginado = [];
    fixture.detectChanges();

    const noDataRow = fixture.debugElement.query(By.css('tbody tr td'));
    expect(noDataRow.nativeElement.textContent).toContain(
      'No hay datos disponibles'
    );
  });

  it('should filter rows based on textoBusqueda', () => {
    component.spinner = false;
    component.mostrarTabla = true;
    component.ingredientesProveedores = mockIngredientesProveedores;
    component.textoBusqueda = 'Fresas';
    component.actualizarTabla();
    fixture.detectChanges();

    expect(component.ingredientesProveedoresPaginado.length).toBe(1);
    expect(
      component.ingredientesProveedoresPaginado[0].ingrediente.nombre
    ).toBe('Fresas');
  });

  it('should change page and update ingredientesProveedoresPaginado', () => {
    component.spinner = false;
    component.mostrarTabla = true;
    component.ingredientesProveedores = [
      ...mockIngredientesProveedores,
      ...mockIngredientesProveedores,
    ]; // 6 items
    component.tamanoPagina = 5;
    component.pagina = 1;
    component.actualizarTabla();

    component.cambiarPagina(2);
    expect(component.ingredientesProveedoresPaginado.length).toBe(1); // Segunda página solo tiene 1 elemento
  });

  it('should sort by precio ascending', () => {
    component.spinner = false;
    component.mostrarTabla = true;
    component.ingredientesProveedores = [...mockIngredientesProveedores];
    component.ordenarPor('precio');

    expect(component.ingredientesProveedores[0].precio).toBe(5);
    expect(component.ingredientesProveedores[2].precio).toBe(20);
  });

  it('should sort by precio descending', () => {
    component.spinner = false;
    component.mostrarTabla = true;
    component.ingredientesProveedores = [...mockIngredientesProveedores];
    component.ordenarPor('precio'); // asc
    component.ordenarPor('precio'); // toggle a desc

    expect(component.ingredientesProveedores[0].precio).toBe(20);
    expect(component.ingredientesProveedores[2].precio).toBe(5);
  });

  it('should sort by proveedor ascending', () => {
    component.spinner = false;
    component.mostrarTabla = true;
    component.ingredientesProveedores = [...mockIngredientesProveedores];
    component.ordenarPor('proveedor');

    expect(component.ingredientesProveedores[0].proveedor.nombre).toBe(
      'Proveedor test 1'
    );
  });

  it('should sort by ingrediente ascending', () => {
    component.spinner = false;
    component.mostrarTabla = true;
    component.ingredientesProveedores = [...mockIngredientesProveedores];
    component.ordenarPor('ingrediente');

    expect(component.ingredientesProveedores[0].ingrediente.nombre).toBe(
      'Fresas'
    );
  });

  it('should return correct color for calificacion', () => {
    expect(component.getColorCalificacion(1)).toBe('rojo');
    expect(component.getColorCalificacion(2)).toBe('rojo');
    expect(component.getColorCalificacion(3)).toBe('naranja');
    expect(component.getColorCalificacion(4)).toBe('amarillo');
    expect(component.getColorCalificacion(5)).toBe('verde');
    expect(component.getColorCalificacion(undefined)).toBe('rojo');
    expect(component.getColorCalificacion(null)).toBe('rojo');
  });
});
