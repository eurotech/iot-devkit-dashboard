import { Injectable } from '@angular/core';
import { SettingsData } from '../models/settings-data';

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
  public clientId: string;
  public deviceId: string;

  private _assetName;
  get assetName() { return this._assetName; }

  private _semanticTopic = 'W1/A1/ModbusAsset';
  get semanticTopic() { return this._semanticTopic; }
  set semanticTopic(newSemanticTopic: string) {
    this._semanticTopic = newSemanticTopic;
    const channelParts = newSemanticTopic.split('/');
    this._assetName = channelParts[channelParts.length - 1];
  }

  public refreshInterval = 5;

  constructor() { }
}
