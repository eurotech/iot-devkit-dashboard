import { TestBed } from '@angular/core/testing';

import { EcHttpClientService } from './ec-http-client.service';

describe('EcHttpClientService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EcHttpClientService = TestBed.get(EcHttpClientService);
    expect(service).toBeTruthy();
  });
});
