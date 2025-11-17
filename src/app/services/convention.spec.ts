import { TestBed } from '@angular/core/testing';

import { Convention } from './convention';

describe('Convention', () => {
  let service: Convention;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Convention);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
