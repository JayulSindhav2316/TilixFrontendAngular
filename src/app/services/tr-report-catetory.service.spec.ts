import { TestBed } from '@angular/core/testing';

import { TrReportCatetoryService } from './tr-report-catetory.service';

describe('TrReportCatetoryService', () => {
  let service: TrReportCatetoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrReportCatetoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
