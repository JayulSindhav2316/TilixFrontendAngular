import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventquestionComponent } from './eventquestion.component';

describe('EventquestionComponent', () => {
  let component: EventquestionComponent;
  let fixture: ComponentFixture<EventquestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventquestionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventquestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
