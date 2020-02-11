export interface DeviceChannelsResult {
  deviceAsset: DeviceAsset[];
}

interface DeviceAsset {
  name: string;
  channels: DeviceChannel[];
}

interface DeviceChannel {
  valueType: string;
  value: string;
  name: string;
  timestamp: string;
}
