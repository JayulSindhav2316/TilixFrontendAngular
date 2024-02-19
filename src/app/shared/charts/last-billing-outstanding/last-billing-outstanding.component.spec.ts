import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LastBillingOutstandingComponent } from './last-billing-outstanding.component';

describe('LastBillingOutstandingComponent', () => {
  let component: LastBillingOutstandingComponent;
  let fixture: ComponentFixture<LastBillingOutstandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LastBillingOutstandingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LastBillingOutstandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
