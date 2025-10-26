/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { IngredienteService } from './ingrediente.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('Service: Ingrediente', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IngredienteService],
      imports: [
        HttpClientTestingModule
      ]
    });
  });

  it('should ...', inject([IngredienteService], (service: IngredienteService) => {
    expect(service).toBeTruthy();
  }));
});
