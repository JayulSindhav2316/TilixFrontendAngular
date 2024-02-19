import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventSetUpComponent } from './event-set-up.component';

describe('EventSetUpComponent', () => {
  let component: EventSetUpComponent;
  let fixture: ComponentFixture<EventSetUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventSetUpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventSetUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
