import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatemembershipComponent } from './createmembership.component';

describe('CreatemembershipComponent', () => {
  let component: CreatemembershipComponent;
  let fixture: ComponentFixture<CreatemembershipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreatemembershipComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatemembershipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
