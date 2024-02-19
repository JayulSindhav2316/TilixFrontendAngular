import { TestBed } from '@angular/core/testing';

import { GLChartOfAccountService } from './glchart-of-account.service';

describe('GLChartOfAccountService', () => {
  let service: GLChartOfAccountService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GLChartOfAccountService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
