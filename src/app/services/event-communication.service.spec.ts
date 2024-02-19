import { TestBed } from '@angular/core/testing';

import { EventCommunicationService } from './event-communication.service';

describe('EventCommunicationService', () => {
  let service: EventCommunicationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventCommunicationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
