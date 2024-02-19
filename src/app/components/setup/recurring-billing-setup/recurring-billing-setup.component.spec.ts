import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringBillingSetupComponent } from './recurring-billing-setup.component';

describe('RecurringBillingSetupComponent', () => {
  let component: RecurringBillingSetupComponent;
  let fixture: ComponentFixture<RecurringBillingSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecurringBillingSetupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringBillingSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
