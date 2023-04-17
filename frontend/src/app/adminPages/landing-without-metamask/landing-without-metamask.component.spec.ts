import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingWithoutMetamaskComponent } from './landing-without-metamask.component';

describe('LandingWithoutMetamaskComponent', () => {
  let component: LandingWithoutMetamaskComponent;
  let fixture: ComponentFixture<LandingWithoutMetamaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LandingWithoutMetamaskComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingWithoutMetamaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
