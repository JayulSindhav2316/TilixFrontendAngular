import { TestBed } from '@angular/core/testing';

import { CustomFieldService } from './custom-field.service';

describe('CustomFieldService', () => {
  let service: CustomFieldService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomFieldService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
