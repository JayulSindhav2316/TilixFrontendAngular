import { TestBed } from '@angular/core/testing';

import { ContactRoleService } from './contact-role.service';

describe('ContactRoleService', () => {
  let service: ContactRoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContactRoleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
