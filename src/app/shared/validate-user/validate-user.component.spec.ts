import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidateUserComponent } from './validate-user.component';

describe('ValidateUserComponent', () => {
  let component: ValidateUserComponent;
  let fixture: ComponentFixture<ValidateUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValidateUserComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidateUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
