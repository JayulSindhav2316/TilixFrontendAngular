import { TestBed } from '@angular/core/testing';

import { TrReportService } from './tr-report-editor.service';

describe('TrReportService', () => {
  let service: TrReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
