import { TestBed } from '@angular/core/testing';

import { AuthNetService } from './auth-net.service';

describe('AuthNetService', () => {
  let service: AuthNetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthNetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
