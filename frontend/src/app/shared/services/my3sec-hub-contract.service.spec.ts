import { TestBed } from '@angular/core/testing';

import { My3secHubContractService } from './my3sec-hub-contract.service';

describe('My3secHubContractService', () => {
  let service: My3secHubContractService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(My3secHubContractService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
