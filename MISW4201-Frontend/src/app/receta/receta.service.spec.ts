/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { RecetaService } from './receta.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('Service: Receta', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RecetaService],
      imports: [
        HttpClientTestingModule
      ]
    });
  });

  it('should ...', inject([RecetaService], (service: RecetaService) => {
    expect(service).toBeTruthy();
  }));
});
