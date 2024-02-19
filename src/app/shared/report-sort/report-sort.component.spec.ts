import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportSortComponent } from './report-sort.component';

describe('ReportSortComponent', () => {
  let component: ReportSortComponent;
  let fixture: ComponentFixture<ReportSortComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportSortComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportSortComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
