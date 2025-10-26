/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ChefService } from './chef.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('Service: Chef', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChefService],
      imports: [
        HttpClientTestingModule
      ]
    });
  });

  it('should ...', inject([ChefService], (service: ChefService) => {
    expect(service).toBeTruthy();
  }));
});
