import { Component } from '@angular/core';
import { EcHttpClientService } from './ec-http-client/ec-http-client.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'devkit-dashboard-ng';

  constructor(private ecHttp: EcHttpClientService) { }

  reset(event: MouseEvent) {
    const id = (event.currentTarget as Element).id;
    this.ecHttp.writeChannel(id, true).subscribe();
  }
}
