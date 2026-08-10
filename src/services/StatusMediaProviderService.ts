import type { IStatusMediaProvider } from '../domain/interfaces/IStatusMediaProvider';
import type { StatusMediaItem, StatusPermissionState } from '../domain/models/StatusMedia';
import { MOCK_STATUS_ITEMS } from '../data/mock/MockStatusMediaData';

export class StatusMediaProviderService implements IStatusMediaProvider {
  private currentPermissionState: StatusPermissionState = 'required';

  public async getPermissionState(): Promise<StatusPermissionState> {
    return this.currentPermissionState;
  }

  public setPermissionState(state: StatusPermissionState): void {
    this.currentPermissionState = state;
  }

  public async getStatusItems(): Promise<StatusMediaItem[]> {
    if (this.currentPermissionState !== 'granted') {
      return [];
    }
    // Simulate brief device scan delay
    await new Promise((resolve) => setTimeout(resolve, 400));
    return MOCK_STATUS_ITEMS;
  }
}

export const statusMediaProviderService = new StatusMediaProviderService();
