import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportColumnComponent } from './report-column.component';

describe('ReportColumnComponent', () => {
  let component: ReportColumnComponent;
  let fixture: ComponentFixture<ReportColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportColumnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
