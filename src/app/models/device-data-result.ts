export interface DeviceDataResult {
  items: DeviceDataMessage[];
}

interface DeviceDataMessage {
  name: string;
  payload: DeviceDataPayload;
}

interface DeviceDataPayload {
  metrics: DeviceDataMetric[];
}

interface DeviceDataMetric {
  valueType: string;
  value: any;
  name: string;
}
