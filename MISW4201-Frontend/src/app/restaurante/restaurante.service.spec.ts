import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { RestauranteService } from './restaurante.service';

describe('RestauranteService', () => {
  let service: RestauranteService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(RestauranteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
