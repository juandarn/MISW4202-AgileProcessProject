/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

import { RecetaCrearComponent } from './receta-crear.component';
import { RecetaService } from '../receta.service';
import { IngredienteService } from 'src/app/ingrediente/ingrediente.service';
import { Component } from '@angular/core';

@Component({ selector: 'app-encabezado', template: '' })
class EncabezadoStubComponent {}

describe('RecetaCrearComponent', () => {
  let component: RecetaCrearComponent;
  let fixture: ComponentFixture<RecetaCrearComponent>;
  let recetaServiceSpy: jasmine.SpyObj<RecetaService>;
  let ingredienteServiceSpy: jasmine.SpyObj<IngredienteService>;

  const activatedRouteMock = {
    parent: {
      snapshot: {
        // solo necesitamos .get('id')
        paramMap: {
          get: (k: string) => (k === 'id' ? '10' : null)
        }
      }
    }
  };

  beforeEach(async(() => {
    recetaServiceSpy = jasmine.createSpyObj('RecetaService', ['crearReceta']);
    ingredienteServiceSpy = jasmine.createSpyObj('IngredienteService', ['darIngredientes']);
    ingredienteServiceSpy.darIngredientes.and.returnValue(of([]));

    TestBed.configureTestingModule({
      declarations: [ RecetaCrearComponent, EncabezadoStubComponent ],
      imports: [
        ReactiveFormsModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
        RouterTestingModule
      ],
      providers: [
        { provide: RecetaService, useValue: recetaServiceSpy },
        { provide: IngredienteService, useValue: ingredienteServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecetaCrearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // dispara ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
