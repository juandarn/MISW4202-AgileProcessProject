/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RecetaEditarComponent } from './receta-editar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EncabezadoComponent } from 'src/app/encabezado-app/encabezado/encabezado.component';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, FormArray } from '@angular/forms';

describe('RecetaEditarComponent', () => {
  let component: RecetaEditarComponent;
  let fixture: ComponentFixture<RecetaEditarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecetaEditarComponent, EncabezadoComponent ],
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
    fixture = TestBed.createComponent(RecetaEditarComponent);
    component = fixture.componentInstance;

    component.recetaForm = new FormGroup({
      nombre: new FormControl('Pizza'),
      duracion: new FormControl(1),
      porcion: new FormControl(2),
      preparacion: new FormControl('Hornear'),
      ingredientes: new FormArray([])
    });

    fixture.detectChanges();
  });

  it('should render the page', () => {
    expect(fixture.nativeElement).toBeTruthy();
  });
});
