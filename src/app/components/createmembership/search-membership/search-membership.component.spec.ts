import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchMembershipComponent } from './search-membership.component';

describe('SearchMembershipComponent', () => {
  let component: SearchMembershipComponent;
  let fixture: ComponentFixture<SearchMembershipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchMembershipComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchMembershipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
