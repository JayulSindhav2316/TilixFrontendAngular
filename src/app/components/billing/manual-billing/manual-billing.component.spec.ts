import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualBillingComponent } from './manual-billing.component';

describe('ManualBillingComponent', () => {
  let component: ManualBillingComponent;
  let fixture: ComponentFixture<ManualBillingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManualBillingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualBillingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
