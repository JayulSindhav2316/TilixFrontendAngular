import { TestBed } from '@angular/core/testing';

import { QuickbooksService } from './quickbooks.service';

describe('QuickbooksService', () => {
  let service: QuickbooksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuickbooksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
