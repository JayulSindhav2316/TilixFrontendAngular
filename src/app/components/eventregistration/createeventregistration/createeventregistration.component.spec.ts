import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateeventregistrationComponent } from './createeventregistration.component';

describe('CreateeventregistrationComponent', () => {
  let component: CreateeventregistrationComponent;
  let fixture: ComponentFixture<CreateeventregistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateeventregistrationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateeventregistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
