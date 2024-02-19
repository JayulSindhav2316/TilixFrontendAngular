import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventinvoiceComponent } from './eventinvoice.component';

describe('EventinvoiceComponent', () => {
  let component: EventinvoiceComponent;
  let fixture: ComponentFixture<EventinvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventinvoiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventinvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
