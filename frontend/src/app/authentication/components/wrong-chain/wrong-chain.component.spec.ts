import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WrongChainComponent } from './wrong-chain.component';

describe('WrongChainComponent', () => {
  let component: WrongChainComponent;
  let fixture: ComponentFixture<WrongChainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WrongChainComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WrongChainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
