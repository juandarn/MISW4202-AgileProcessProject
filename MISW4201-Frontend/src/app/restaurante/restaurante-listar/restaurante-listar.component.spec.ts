import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { RestauranteListarComponent } from './restaurante-listar.component';
import { RestauranteService } from '../restaurante.service';
import { ToastrService } from 'ngx-toastr';

describe('RestauranteListarComponent', () => {
  let component: RestauranteListarComponent;
  let fixture: ComponentFixture<RestauranteListarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RestauranteListarComponent],
      imports: [RouterTestingModule],
      providers: [
        {
          provide: RestauranteService,
          useValue: { darRestaurantes: () => of([]) }, // mock mínimo
        },
        {
          provide: ToastrService,
          useValue: { error: () => {}, success: () => {} }, // mock mínimo
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA], // 👈 con esto Angular ignora <app-encabezado> y <tabla-app>
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RestauranteListarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
