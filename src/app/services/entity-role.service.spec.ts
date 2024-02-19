import { TestBed } from '@angular/core/testing';

import { EntityRoleService } from './entity-role.service';

describe('EntityRoleService', () => {
  let service: EntityRoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EntityRoleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
