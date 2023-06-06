import { TestBed } from '@angular/core/testing';

import { ImageConversionService } from './image-conversion.service';

describe('ImageConversionService', () => {
  let service: ImageConversionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageConversionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
