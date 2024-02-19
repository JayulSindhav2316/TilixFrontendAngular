import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowEditInvoiceRecepitComponent } from './show-edit-invoice-recepit.component';

describe('ShowEditInvoiceRecepitComponent', () => {
  let component: ShowEditInvoiceRecepitComponent;
  let fixture: ComponentFixture<ShowEditInvoiceRecepitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowEditInvoiceRecepitComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowEditInvoiceRecepitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
