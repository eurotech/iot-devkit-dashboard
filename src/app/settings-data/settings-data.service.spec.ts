import { TestBed } from '@angular/core/testing';

import { SettingsDataService } from './settings-data.service';

describe('SettingsDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SettingsDataService = TestBed.get(SettingsDataService);
    expect(service).toBeTruthy();
  });
});
