import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ReporteCompraComponent } from './reporte-compra.component';

@Component({ selector: 'app-encabezado', template: '' })
class EncabezadoStubComponent {}

describe('ReporteCompraComponent', () => {
  let component: ReporteCompraComponent;
  let fixture: ComponentFixture<ReporteCompraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReporteCompraComponent, EncabezadoStubComponent],
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => '1',
              },
            },
            paramMap: of({
              get: (key: string) => '1',
            }),
          },
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteCompraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
