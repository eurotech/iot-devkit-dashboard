import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { SettingsDialogComponent } from '../settings-dialog/settings-dialog.component';
import { SettingsDataService } from '../settings-data/settings-data.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

import { EcHttpClientService } from '../ec-http-client/ec-http-client.service';
import { MatSnackBar } from '@angular/material/snack-bar';

import { DeviceChannelsResult } from '../models/device-channels-result';
import { PlcStatusService } from '../plc-status/plc-status.service';

import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private settingsData: SettingsDataService,
    private http: EcHttpClientService,
    private plcStatus: PlcStatusService
  ) { }

  ngOnInit() {
  }

  public handleConnect(event: MatSlideToggleChange): void {
    if (event.checked) {
      event.source.disabled = true;
      this.http.doAuth().toPromise()
        .then((authResult) => {
          this.settingsData.accessToken = authResult.tokenId;
          this.settingsData.refreshToken = authResult.refreshToken;
          return this.http.findDevice(this.settingsData.clientId).toPromise();
        })
        .then((deviceResult) => {
          this.settingsData.deviceId = deviceResult.items[0].id;
        })
        .then(() => {
          return this.http.readAllChannels().toPromise();
        })
        .then((channelsResult: DeviceChannelsResult) => {
          for (const channel of channelsResult.deviceAsset[0].channels) {
            let value;
            switch (channel.valueType) {
              case 'boolean':
                value = channel.value === 'true';
                break;
              case 'integer':
                value = parseInt(channel.value, 10);
                break;
              default:
                value = channel.value;
            }
            this.plcStatus.status[channel.name] = value;
          }
        })
        .then(() => {
          event.source.checked = true;
          event.source.disabled = false;
          this.snackBar.open('Connected!', null, {
            duration: 3000
          });
        })
        .catch((error) => {
          this.snackBar.open(error.message, null, {
            duration: 3000
          });
          event.source.checked = false;
          event.source.disabled = false;
        });
    }
  }

  public openSettings(): void {
    const dialogRef = this.dialog.open(SettingsDialogComponent, {
      data: {
        username: this.settingsData.username,
        password: this.settingsData.password,
        baseUri: this.settingsData.baseUri,
        clientId: this.settingsData.clientId,
        assetName: this.settingsData.assetName
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.settingsData.username = result.username;
        this.settingsData.password = result.password;
        this.settingsData.baseUri = result.baseUri;
        this.settingsData.clientId = result.clientId;
        this.settingsData.assetName = result.assetName;
      }
    });
  }

}
