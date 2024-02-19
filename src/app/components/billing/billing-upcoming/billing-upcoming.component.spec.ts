import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingUpcomingComponent } from './billing-upcoming.component';

describe('BillingUpcomingComponent', () => {
  let component: BillingUpcomingComponent;
  let fixture: ComponentFixture<BillingUpcomingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillingUpcomingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingUpcomingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
