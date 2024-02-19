import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LastBillingMembershipTypeComponent } from './last-billing-membership-type.component';

describe('LastBillingMembershipTypeComponent', () => {
  let component: LastBillingMembershipTypeComponent;
  let fixture: ComponentFixture<LastBillingMembershipTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LastBillingMembershipTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LastBillingMembershipTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
