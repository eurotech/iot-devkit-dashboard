import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsDataService } from '../settings-data/settings-data.service';
import { Observable, interval } from 'rxjs';
import { DeviceListResult } from '../models/device-list-result';
import { DeviceChannelsResult } from '../models/device-channels-result';
import { switchMap } from 'rxjs/operators';
import { AccessToken } from '../models/access-token';
import {DeviceDataResult} from '../models/device-data-result';

@Injectable({
  providedIn: 'root'
})
export class EcHttpClientService {

  constructor(private http: HttpClient, private settingsData: SettingsDataService) { }

  public doAuth(): Observable<AccessToken> {
    return this.http.post<AccessToken>(this.settingsData.baseUri + '/authentication/user', {
      username: this.settingsData.username,
      password: this.settingsData.password
    });
  }

  public refresh(): Observable<AccessToken> {
    return this.http.post<AccessToken>(`${this.settingsData.baseUri}/authentication/refresh`, {
      username: this.settingsData.username,
      password: this.settingsData.password
    }, {
      headers: {
        Authorization: `Bearer ${this.settingsData.accessToken}`
      }
    });
  }

  public findDevice(clientId: string): Observable<DeviceListResult> {
    return this.http.get<DeviceListResult>(`${this.settingsData.baseUri}/_/devices?clientId=${this.settingsData.clientId}`,
      {
        headers: {
          Authorization: `Bearer ${this.settingsData.accessToken}`
        }
      });
  }

  public readAllChannels(): Observable<DeviceChannelsResult> {
    return this.http.post<DeviceChannelsResult>(`${this.settingsData.baseUri}/_/devices/${this.settingsData.deviceId}/assets/_read`,
      {
        type: 'deviceAssets',
        deviceAsset: [
          {
            name: this.settingsData.semanticTopic
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${this.settingsData.accessToken}`
        }
      });
  }

  public readAllData(): Observable<DeviceDataResult> {
    return this.http.get<DeviceDataResult>(
      `${this.settingsData.baseUri}/_/data/messages?clientId=${this.settingsData.clientId}` +
                                                      `&channel=${this.settingsData.semanticTopic}` +
                                                      `&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${this.settingsData.accessToken}`
        }
      });
  }

  public writeChannel(channelName: string, value: any) {
    return this.http.post(`${this.settingsData.baseUri}/_/devices/${this.settingsData.deviceId}/assets/_write`, {
      type: 'deviceAssets',
      deviceAsset: [
        {
          name: this.settingsData.assetName,
          channels: [
            {
              valueType: typeof (value),
              value,
              name: channelName
            }
          ]
        }
      ]
    },
      {
        headers: {
          Authorization: `Bearer ${this.settingsData.accessToken}`
        }
      });
  }

  public startPolling(): Observable<any> {
    return interval(this.settingsData.refreshInterval * 1000)
      .pipe(
        switchMap(() => this.readAllData())
      );
  }
}
