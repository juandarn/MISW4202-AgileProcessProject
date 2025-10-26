/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ProveedorService } from './proveedor.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('Service: Ingrediente', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProveedorService],
      imports: [
        HttpClientTestingModule
      ]
    });
  });

  it('should ...', inject([ProveedorService], (service: ProveedorService) => {
    expect(service).toBeTruthy();
  }));
});
