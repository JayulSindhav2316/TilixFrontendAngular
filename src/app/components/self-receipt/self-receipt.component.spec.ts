import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelfReceiptComponent } from './self-receipt.component';

describe('SelfReceiptComponent', () => {
  let component: SelfReceiptComponent;
  let fixture: ComponentFixture<SelfReceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelfReceiptComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelfReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
