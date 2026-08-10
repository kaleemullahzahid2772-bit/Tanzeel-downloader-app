type NetworkListener = (isOnline: boolean) => void;

export class NetworkStatusService {
  private listeners: Set<NetworkListener> = new Set();
  private onlineState: boolean = typeof navigator !== 'undefined' ? (navigator.onLine ?? true) : true;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleStateChange(true));
      window.addEventListener('offline', () => this.handleStateChange(false));
    }
  }

  private handleStateChange(isOnline: boolean) {
    this.onlineState = isOnline;
    this.listeners.forEach((fn) => fn(isOnline));
  }

  public isOnline(): boolean {
    return this.onlineState ?? true;
  }

  public subscribe(listener: NetworkListener): () => void {
    this.listeners.add(listener);
    listener(this.isOnline());
    return () => this.listeners.delete(listener);
  }
}

export const networkStatusService = new NetworkStatusService();
