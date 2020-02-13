import { Component, OnInit } from '@angular/core';
import { EcHttpClientService } from '../ec-http-client/ec-http-client.service';
import { PlcStatusService } from '../plc-status/plc-status.service';

@Component({
  selector: 'app-plc',
  templateUrl: './plc.component.svg',
  styleUrls: ['./plc.component.scss']
})
export class PlcComponent implements OnInit {

  constructor(private ecHttp: EcHttpClientService, public plcStatus: PlcStatusService) { }

  ngOnInit() {
  }

  clickLed(event: MouseEvent) {
    const id = (event.target as Element).id;
    this.plcStatus.status[id] = !this.plcStatus.status[id];
    this.ecHttp.writeChannel(id, this.plcStatus.status[id]).subscribe();
  }
}
