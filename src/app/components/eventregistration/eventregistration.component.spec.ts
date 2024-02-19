import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventregistrationComponent } from './eventregistration.component';

describe('EventregistrationComponent', () => {
  let component: EventregistrationComponent;
  let fixture: ComponentFixture<EventregistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventregistrationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventregistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
