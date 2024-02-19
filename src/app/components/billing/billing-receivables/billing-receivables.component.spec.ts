import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingReceivablesComponent } from './billing-receivables.component';

describe('BillingReceivablesComponent', () => {
  let component: BillingReceivablesComponent;
  let fixture: ComponentFixture<BillingReceivablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillingReceivablesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingReceivablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
