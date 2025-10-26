import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';

import { RecetaCompartirComponent } from './receta-compartir.component';

describe('RecetaCompartirComponent', () => {
  let component: RecetaCompartirComponent;
  let fixture: ComponentFixture<RecetaCompartirComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecetaCompartirComponent],
      imports: [
        RouterTestingModule,      // para routerLink / ActivatedRoute
        HttpClientTestingModule,  // para servicios que usan HttpClient
        ToastrModule.forRoot(),   // para ToastrService sin mocks
      ],
      // No mockeamos componentes: sólo permitimos etiquetas desconocidas
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RecetaCompartirComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render the page', () => {
    expect(component).toBeTruthy();
  });
});
