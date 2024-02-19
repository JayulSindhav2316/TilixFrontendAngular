import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoBillingComponent } from './auto-billing.component';

describe('AutoBillingComponent', () => {
  let component: AutoBillingComponent;
  let fixture: ComponentFixture<AutoBillingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutoBillingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoBillingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
