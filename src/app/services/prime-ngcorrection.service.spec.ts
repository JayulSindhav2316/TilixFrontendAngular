import { TestBed } from '@angular/core/testing';

import { PrimeNGCorrectionService } from './prime-ngcorrection.service';

describe('PrimeNGCorrectionService', () => {
  let service: PrimeNGCorrectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrimeNGCorrectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
