import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressComponentComponent } from './progress-component.component';

describe('ProgressComponentComponent', () => {
  let component: ProgressComponentComponent;
  let fixture: ComponentFixture<ProgressComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgressComponentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
