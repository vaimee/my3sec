import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileExistsComponent } from './profile-exists.component';

describe('ProfileExistsComponent', () => {
  let component: ProfileExistsComponent;
  let fixture: ComponentFixture<ProfileExistsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileExistsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileExistsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
