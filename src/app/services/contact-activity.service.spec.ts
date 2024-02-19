import { TestBed } from '@angular/core/testing';

import { ContactActivityService } from './contact-activity.service';

describe('ContactActivityService', () => {
  let service: ContactActivityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContactActivityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
