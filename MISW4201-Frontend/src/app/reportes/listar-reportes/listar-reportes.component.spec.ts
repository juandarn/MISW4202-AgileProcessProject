import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ListarReportesComponent } from './listar-reportes.component';
import { EncabezadoAppModule } from 'src/app/encabezado-app/encabezado-app.module';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('ListarReportesComponent', () => {
  let component: ListarReportesComponent;
  let fixture: ComponentFixture<ListarReportesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListarReportesComponent],
      imports: [EncabezadoAppModule,
        HttpClientTestingModule,   // 
        RouterTestingModule        //  
      ],
      schemas: [NO_ERRORS_SCHEMA], // Ignora los componentes hijos no declarados
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListarReportesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not display any report initially', () => {
    const historialEl = fixture.debugElement.query(
      By.css('app-tabla-historial-precios')
    );
    const ingredientEl = fixture.debugElement.query(
      By.css('app-tabla-ingredientexproveedor')
    );
    expect(component.reporteSeleccionado).toBeNull();
    expect(historialEl).toBeNull();
    expect(ingredientEl).toBeNull();
  });

  it('should display historial report when "Historial de precios" button is clicked', () => {
    const botonHistorial = fixture.debugElement.query(
      By.css('[data-testid="btn-historial"]')
    );
    expect(botonHistorial).toBeTruthy();

    botonHistorial.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(component.reporteSeleccionado).toBe('historial');
    const historialEl = fixture.debugElement.query(
      By.css('app-tabla-historial-precios')
    );
    expect(historialEl).toBeTruthy();
  });

  it('should display ingrediente x proveedor report when button is clicked', () => {
    const botonIngrediente = fixture.debugElement.query(
      By.css('[data-testid="btn-ingredientexproveedor"]')
    );
    expect(botonIngrediente).toBeTruthy();

    botonIngrediente.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(component.reporteSeleccionado).toBe('ingredientexproveedor');
    const ingredientEl = fixture.debugElement.query(
      By.css('app-tabla-ingredientexproveedor')
    );
    expect(ingredientEl).toBeTruthy();
  });
});
