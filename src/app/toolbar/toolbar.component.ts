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
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  @ViewChild('connect')
  connect: MatButton;

  @ViewChild('disconnect')
  disconnect: MatButton;

  public pollingConnection: Subscription;

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
          error: (loginError) => this.handleDisconnect(loginError.message)
        });
      } else {
        this.handleDisconnect(error.message);
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

  public handleConnect(): void {
    // Connect
    this.connect.disabled = true;
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
            this.connect.disabled = false;
            this.snackBar.open('Connected!', null, {
              duration: 3000
            });
            this.pollingConnection = this.http.startPolling().subscribe(this.plcObserver);
          },
          error: (error) => this.handleDisconnect(error.message)
        }
      );
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
        this.handleConnect();
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

  public handleDisconnect(message) {
    this.pollingConnection?.unsubscribe();
    if (message) {
      this.snackBar.open(message, null, {
        duration: 3000
      });
    }
    if (this.connect) {
      this.connect.disabled = false;
    }
  }

}
