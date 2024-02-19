import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventreviewComponent } from './eventreview.component';

describe('EventreviewComponent', () => {
  let component: EventreviewComponent;
  let fixture: ComponentFixture<EventreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventreviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
