import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralEditInvoiceComponent } from './general-edit-invoice.component';

describe('GeneralEditInvoiceComponent', () => {
  let component: GeneralEditInvoiceComponent;
  let fixture: ComponentFixture<GeneralEditInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneralEditInvoiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralEditInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
