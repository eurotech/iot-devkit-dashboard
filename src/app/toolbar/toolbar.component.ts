import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { SettingsDialogComponent } from '../settings-dialog/settings-dialog.component';
import { SettingsDataService } from '../settings-data/settings-data.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

import { EcHttpClientService } from '../ec-http-client/ec-http-client.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    private http: EcHttpClientService
  ) { }

  ngOnInit() {
  }

  public handleConnect(event: MatSlideToggleChange): void {
    if (event.checked) {
      event.source.disabled = true;
      this.http.doAuth()
      .subscribe((result) => {
        this.snackBar.open('Connected!', null, {
          duration: 3000
        });
        this.settingsData.accessToken = result.tokenId;
        this.settingsData.refreshToken = result.refreshToken;
        event.source.disabled = false;
      },
      error => {
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
        baseUri: this.settingsData.baseUri
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.settingsData.username = result.username;
        this.settingsData.password = result.password;
        this.settingsData.baseUri = result.baseUri;
      }
    });
  }

}
