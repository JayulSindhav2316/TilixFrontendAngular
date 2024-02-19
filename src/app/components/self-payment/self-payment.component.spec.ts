import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelfPaymentComponent } from './self-payment.component';

describe('SelfPaymentComponent', () => {
  let component: SelfPaymentComponent;
  let fixture: ComponentFixture<SelfPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelfPaymentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelfPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
