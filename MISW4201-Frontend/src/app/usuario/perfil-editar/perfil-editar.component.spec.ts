/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PerfilEditarComponent } from './perfil-editar.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';
import { EncabezadoComponent } from 'src/app/encabezado-app/encabezado/encabezado.component';
describe('PerfilEditarComponent', () => {
  let component: PerfilEditarComponent;
  let fixture: ComponentFixture<PerfilEditarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PerfilEditarComponent, EncabezadoComponent],

      imports: [
        ReactiveFormsModule,
        FormsModule,
        HttpClientTestingModule,
        ToastrModule.forRoot(),
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PerfilEditarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
