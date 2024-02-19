import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactRoleComponent } from './contact-role.component';

describe('ContactRoleComponent', () => {
  let component: ContactRoleComponent;
  let fixture: ComponentFixture<ContactRoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContactRoleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
