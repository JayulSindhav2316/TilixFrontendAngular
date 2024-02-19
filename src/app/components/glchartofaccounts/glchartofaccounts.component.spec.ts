import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlchartofaccountsComponent } from './glchartofaccounts.component';

describe('GlchartofaccountsComponent', () => {
  let component: GlchartofaccountsComponent;
  let fixture: ComponentFixture<GlchartofaccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GlchartofaccountsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GlchartofaccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
