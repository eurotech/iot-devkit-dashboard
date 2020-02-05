import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsDataService implements SettingsData {

  public username: string;
  public password: string;

  private _baseUri = 'http://localhost:8081/v1';
  get baseUri() { return this._baseUri; }
  set baseUri(newValue: string) {
    this._baseUri = newValue.replace(/\/+$/, '');
  }

  public accessToken: string;
  public refreshToken: string;

  constructor() { }
}
