import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProveedorIngredienteComponent } from './proveedor-ingrediente.component';

describe('ProveedorIngredienteComponent', () => {
  let component: ProveedorIngredienteComponent;
  let fixture: ComponentFixture<ProveedorIngredienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProveedorIngredienteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProveedorIngredienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
