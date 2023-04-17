import { TestBed } from '@angular/core/testing';

import { IsMetamskGuard } from './is-metamsk.guard';

describe('IsMetamskGuard', () => {
  let guard: IsMetamskGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(IsMetamskGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
