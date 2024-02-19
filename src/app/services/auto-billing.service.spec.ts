import { TestBed } from '@angular/core/testing';

import { AutoBillingService } from './auto-billing.service';

describe('AutoBillingService', () => {
  let service: AutoBillingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AutoBillingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
