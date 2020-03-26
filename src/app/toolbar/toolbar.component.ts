import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { SettingsDialogComponent } from '../settings-dialog/settings-dialog.component';
import { SettingsDataService } from '../settings-data/settings-data.service';

import { EcHttpClientService } from '../ec-http-client/ec-http-client.service';
import { MatSnackBar } from '@angular/material/snack-bar';

import { PlcStatusService } from '../plc-status/plc-status.service';

import { switchMap } from 'rxjs/operators';
import { EMPTY, Subscription, PartialObserver } from 'rxjs';
import { MatButton } from '@angular/material/button';
import { DeviceDataResult } from '../models/device-data-result';

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

  plcObserver: PartialObserver<DeviceDataResult> = {
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
          return this.http.readAllData();
        }),
        switchMap((dataResult) => this.updatePlc(dataResult))
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
        semanticTopic: this.settingsData.semanticTopic,
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
        this.settingsData.semanticTopic = result.semanticTopic;
        this.settingsData.refreshInterval = result.refreshInterval;
        this.handleConnect();
      }
    });
  }

  private updatePlc(dataResult: DeviceDataResult) {
    for (const metric of dataResult.items[0].payload.metrics) {
      let value: string | number | boolean;
      switch (metric.valueType) {
        case 'boolean':
          value = metric.value === 'true';
          break;
        case 'integer':
          value = parseInt(metric.value, 10);
          break;
        default:
          value = metric.value;
      }
      this.plcStatus.status[metric.name] = value;
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
