import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';

import { RestauranteEditarComponent } from './restaurante-editar.component';
import { RestauranteService } from '../restaurante.service';
import { ToastrService } from 'ngx-toastr';

@Component({ selector: 'app-encabezado', template: '' })
class MockEncabezadoComponent {}

describe('RestauranteEditarComponent', () => {
  let component: RestauranteEditarComponent;
  let fixture: ComponentFixture<RestauranteEditarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        RestauranteEditarComponent,
        MockEncabezadoComponent
      ],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientTestingModule   
      ],
      providers: [
        {
          provide: RestauranteService,
          useValue: { darRestaurante: () => of({ id: 1 }) },
        },
        {
          provide: ToastrService,
          useValue: { success: () => {}, error: () => {} },
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RestauranteEditarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
