import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { SettingsDialogComponent } from '../settings-dialog/settings-dialog.component';
import { SettingsDataService } from '../settings-data/settings-data.service';
import { MatSlideToggleChange, MatSlideToggle } from '@angular/material/slide-toggle';

import { EcHttpClientService } from '../ec-http-client/ec-http-client.service';
import { MatSnackBar } from '@angular/material/snack-bar';

import { PlcStatusService } from '../plc-status/plc-status.service';

import { switchMap, tap } from 'rxjs/operators';
import { EMPTY, Subscription, PartialObserver } from 'rxjs';
import { DeviceChannelsResult } from '../models/device-channels-result';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  @ViewChild('connect')
  connect: MatSlideToggle;

  pollingConnection: Subscription;
  plcObserver: PartialObserver<DeviceChannelsResult> = {
    next: (channelsResult) => {
      this.updatePlc(channelsResult);
    },
    error: (error) => {
      if (error.status === 401) {
        this.http.doAuth().subscribe({
          next: (loginResult) => {
            this.settingsData.accessToken = loginResult.tokenId;
            this.settingsData.refreshToken = loginResult.refreshToken;
            this.pollingConnection = this.http.startPolling().subscribe(this.plcObserver);
          },
          error: (loginError) => this.handleDisconnect(loginError)
        });
      } else {
        this.handleDisconnect(error);
      }
    }
  };

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
      // Connect
      event.source.disabled = true;
      this.http.doAuth()
        .pipe(
          switchMap((authResult) => {
            this.settingsData.accessToken = authResult.tokenId;
            this.settingsData.refreshToken = authResult.refreshToken;
            return this.http.findDevice(this.settingsData.clientId);
          }),
          switchMap((deviceResult) => {
            this.settingsData.deviceId = deviceResult.items[0].id;
            return EMPTY;
          }),
          switchMap(() => {
            return this.http.readAllChannels();
          }),
          switchMap((channelsResult) => this.updatePlc(channelsResult))
        )
        .subscribe(
          {
            complete: () => {
              event.source.checked = true;
              event.source.disabled = false;
              this.snackBar.open('Connected!', null, {
                duration: 3000
              });
              this.pollingConnection = this.http.startPolling().subscribe(this.plcObserver);
            },
            error: (error) => this.handleDisconnect(error)
          }
        );
    } else {
      // Disconnect
      this.pollingConnection.unsubscribe();
    }
  }

  public openSettings(): void {
    const dialogRef = this.dialog.open(SettingsDialogComponent, {
      data: {
        username: this.settingsData.username,
        password: this.settingsData.password,
        baseUri: this.settingsData.baseUri,
        clientId: this.settingsData.clientId,
        assetName: this.settingsData.assetName,
        refreshInterval: this.settingsData.refreshInterval
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
        this.settingsData.refreshInterval = result.refreshInterval;
      }
    });
  }

  private updatePlc(channelsResult) {
    for (const channel of channelsResult.deviceAsset[0].channels) {
      let value: string | number | boolean;
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
    return EMPTY;
  }

  private handleDisconnect(error) {
    this.snackBar.open(error.message, null, {
      duration: 3000
    });
    this.connect.checked = false;
    this.connect.disabled = false;
  }

}
