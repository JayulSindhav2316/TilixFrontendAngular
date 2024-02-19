import { TestBed } from '@angular/core/testing';

import { GlobalEventHandlerService } from './global-event-handler.service';

describe('GlobalEventHandlerService', () => {
  let service: GlobalEventHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GlobalEventHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
