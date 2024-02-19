import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupsCRMComponent } from './groups-crm.component';

describe('GroupsCRMComponent', () => {
  let component: GroupsCRMComponent;
  let fixture: ComponentFixture<GroupsCRMComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupsCRMComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupsCRMComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
