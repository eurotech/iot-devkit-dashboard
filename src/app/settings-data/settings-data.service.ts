import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsDataService implements SettingsData {

  public username: string;
  public password: string;
  public baseUri = 'http://localhost:8080/v1/';

  constructor() { }
}
