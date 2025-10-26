/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RecetaListaComponent } from './receta-lista.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TablaAppModule } from 'src/app/tabla-app/tabla-app.module';
import { of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { RecetaService } from '../receta.service';
import { Component } from '@angular/core';

@Component({ selector: 'app-encabezado', template: '' })
class EncabezadoStubComponent {}

describe('RecetaListaComponent', () => {
  let component: RecetaListaComponent;
  let fixture: ComponentFixture<RecetaListaComponent>;
  let recetaServiceSpy: jasmine.SpyObj<RecetaService>;

  // Mock de ActivatedRoute con parent y :id
  const activatedRouteMock = {
    parent: {
      snapshot: {
        paramMap: {
          get: (k: string) => (k === 'id' ? '10' : null)
        }
      }
    }
  };

  beforeEach(async(() => {
    recetaServiceSpy = jasmine.createSpyObj('RecetaService', ['darRecetas', 'borrarReceta']);
    // devolvemos lista vacía para no pegarle a HTTP ni a sessionStorage
    recetaServiceSpy.darRecetas.and.returnValue(of([]));

    TestBed.configureTestingModule({
      declarations: [ RecetaListaComponent, EncabezadoStubComponent ],
      imports: [
        RouterTestingModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
        TablaAppModule
      ],
      providers: [
        { provide: RecetaService, useValue: recetaServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecetaListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // dispara ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
