/* tslint:disable:no-unused-variable */
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { RestauranteDetalleComponent } from './restaurante-detalle.component';
import { EncabezadoComponent } from 'src/app/encabezado-app/encabezado/encabezado.component';
import { ToastrModule } from 'ngx-toastr';

describe('Component: RestauranteDetalle', () => {
  let component: RestauranteDetalleComponent;
  let fixture: ComponentFixture<RestauranteDetalleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RestauranteDetalleComponent, EncabezadoComponent],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        ToastrModule.forRoot(),
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RestauranteDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
