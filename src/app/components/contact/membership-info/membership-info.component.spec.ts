import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MembershipInfoComponent } from './membership-info.component';

describe('MembershipInfoComponent', () => {
  let component: MembershipInfoComponent;
  let fixture: ComponentFixture<MembershipInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MembershipInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MembershipInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
