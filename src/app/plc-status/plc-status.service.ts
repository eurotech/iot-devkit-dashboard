import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlcStatusService {

  public status = {
    LED1: false,
    LED2: false,
    LED3: false,
    'LED4-BLUE': false,
    'LED4-GREEN': false,
    'LED4-RED': false,
    'Toggle-4': false,
    'Toggle-5': false,
    'Toggle-6': false,
    'Quad-Counter': '',
    'Counter-3': ''
  };

  constructor() { }
}
