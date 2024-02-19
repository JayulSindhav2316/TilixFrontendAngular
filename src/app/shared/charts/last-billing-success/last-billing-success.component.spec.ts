import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LastBillingSuccessComponent } from './last-billing-success.component';

describe('LastBillingSuccessComponent', () => {
  let component: LastBillingSuccessComponent;
  let fixture: ComponentFixture<LastBillingSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LastBillingSuccessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LastBillingSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
