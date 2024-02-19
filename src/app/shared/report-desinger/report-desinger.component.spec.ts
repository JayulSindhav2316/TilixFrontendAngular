import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportDesingerComponent } from './report-desinger.component';

describe('ReportDesingerComponent', () => {
  let component: ReportDesingerComponent;
  let fixture: ComponentFixture<ReportDesingerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportDesingerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportDesingerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
