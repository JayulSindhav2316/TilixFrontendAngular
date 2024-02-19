import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchContactRoleComponent } from './search-contact-role.component';

describe('SearchContactRoleComponent', () => {
  let component: SearchContactRoleComponent;
  let fixture: ComponentFixture<SearchContactRoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchContactRoleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchContactRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
