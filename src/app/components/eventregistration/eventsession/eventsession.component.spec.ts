import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsessionComponent } from './eventsession.component';

describe('EventsessionComponent', () => {
  let component: EventsessionComponent;
  let fixture: ComponentFixture<EventsessionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventsessionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventsessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
