/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormControl, FormGroup, FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ProveedorEditarComponent } from './proveedor-editar.component';
import { EncabezadoComponent } from 'src/app/encabezado-app/encabezado/encabezado.component';

describe('ProveedorEditarComponent', () => {
  let component: ProveedorEditarComponent;
  let fixture: ComponentFixture<ProveedorEditarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProveedorEditarComponent, EncabezadoComponent ],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        ToastrModule.forRoot(),
        BrowserAnimationsModule,
        ReactiveFormsModule,
        FormsModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProveedorEditarComponent);
    component = fixture.componentInstance;

    component.ingredientesSubForm = new FormArray([]);
    component.proveedorForm = new FormGroup({
      id: new FormControl(1),
      nombre: new FormControl('Proveedor Test'),
      cedula: new FormControl('123456'),
      telefono: new FormControl('3001234567'),
      correo: new FormControl('test@correo.com'),
      direccion: new FormControl('Calle Falsa 123'),
      calificacion: new FormControl(5),
      ingredientes: component.ingredientesSubForm
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
