import { TestBed } from '@angular/core/testing';
import { IsMetamaskGuard } from './metaMask.guard';



describe('IsMetamskGuard', () => {
  let guard: IsMetamaskGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(IsMetamaskGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
