import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventQuestionsComponent } from './event-questions.component';

describe('EventQuestionsComponent', () => {
  let component: EventQuestionsComponent;
  let fixture: ComponentFixture<EventQuestionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventQuestionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
