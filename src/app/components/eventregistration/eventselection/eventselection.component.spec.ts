import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventselectionComponent } from './eventselection.component';

describe('EventselectionComponent', () => {
  let component: EventselectionComponent;
  let fixture: ComponentFixture<EventselectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventselectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventselectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
