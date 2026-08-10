export type StatusMediaType = 'IMAGE' | 'VIDEO' | 'UNKNOWN' | 'image' | 'video' | 'unknown';
export type StatusPermissionState = 'granted' | 'denied' | 'not_requested' | 'permanently_denied' | 'required' | 'empty' | 'error';

export interface StatusMedia {
  id: string;
  uri?: string;
  type: StatusMediaType;
  thumbnailUrl: string;
  displayName?: string;
  fileSizeBytes?: number;
  fileSizeFormatted?: string;
  timestamp: string; // ISO format
  dateFormatted?: string;
  isSaved?: boolean;
  
  // Legacy component properties
  mediaUrl?: string;
  appType?: string;
  fileSize?: string;
  duration?: string;
  isMockData?: boolean;
}

export type StatusMediaItem = StatusMedia;
