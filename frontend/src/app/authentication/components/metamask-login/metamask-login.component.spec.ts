import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetamaskLoginComponent } from './metamask-login.component';

describe('MetamaskLoginComponent', () => {
  let component: MetamaskLoginComponent;
  let fixture: ComponentFixture<MetamaskLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MetamaskLoginComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetamaskLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
