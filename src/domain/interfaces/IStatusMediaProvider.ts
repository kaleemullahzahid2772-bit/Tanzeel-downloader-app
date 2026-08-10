import type { StatusMediaItem, StatusPermissionState } from '../models/StatusMedia';

export interface IStatusMediaProvider {
  getStatusItems(): Promise<StatusMediaItem[]>;
  getPermissionState(): Promise<StatusPermissionState>;
}
