import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { RestauranteCrearComponent } from './restaurante-crear.component';

describe('RestauranteCrearComponent', () => {
  let component: RestauranteCrearComponent;
  let fixture: ComponentFixture<RestauranteCrearComponent>;

  // Mock del ToastrService
  const toastrMock = {
    success: jasmine.createSpy('success'),
    error: jasmine.createSpy('error'),
    info: jasmine.createSpy('info'),
    warning: jasmine.createSpy('warning'),
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RestauranteCrearComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule, // 👈 para mockear HttpClient
      ],
      providers: [{ provide: ToastrService, useValue: toastrMock }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA], // 👈 ignora componentes como <app-encabezado>
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestauranteCrearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
