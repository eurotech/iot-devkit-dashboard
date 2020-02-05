import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SettingsDataService } from '../settings-data/settings-data.service';
import { Observable } from 'rxjs';

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
    return this.http.post<AccessToken>(this.settingsData.baseUri + '/authentication/refresh', {
      username: this.settingsData.username,
      password: this.settingsData.password
    }, {
      headers: {
        Authorization: `Bearer ${this.settingsData.refreshToken}`
      }
    });
  }
}
