import { TestBed } from '@angular/core/testing';

import { AcceptjsService } from './acceptjs.service';

describe('AcceptjsService', () => {
  let service: AcceptjsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AcceptjsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
