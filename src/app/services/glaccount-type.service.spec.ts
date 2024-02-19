import { TestBed } from '@angular/core/testing';

import { GLAccountTypeService } from './glaccount-type.service';

describe('GLAccountTypeService', () => {
  let service: GLAccountTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GLAccountTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
