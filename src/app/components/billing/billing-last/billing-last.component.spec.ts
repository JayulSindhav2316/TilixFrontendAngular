import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingLastComponent } from './billing-last.component';

describe('BillingLastComponent', () => {
  let component: BillingLastComponent;
  let fixture: ComponentFixture<BillingLastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BillingLastComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BillingLastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
