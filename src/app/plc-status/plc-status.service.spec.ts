import { TestBed } from '@angular/core/testing';

import { PlcStatusService } from './plc-status.service';

describe('PlcStatusService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PlcStatusService = TestBed.get(PlcStatusService);
    expect(service).toBeTruthy();
  });
});
