export const TaskState = {
  IDLE: 'IDLE',
  QUEUED: 'QUEUED',
  ANALYZING: 'ANALYZING',
  DOWNLOADING: 'DOWNLOADING',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;

export type TaskState = typeof TaskState[keyof typeof TaskState];

export const TASK_STATE_LABELS: Record<TaskState, string> = {
  [TaskState.IDLE]: 'Idle',
  [TaskState.QUEUED]: 'Queued',
  [TaskState.ANALYZING]: 'Analyzing...',
  [TaskState.DOWNLOADING]: 'Downloading...',
  [TaskState.PAUSED]: 'Paused',
  [TaskState.COMPLETED]: 'Completed',
  [TaskState.FAILED]: 'Failed',
  [TaskState.CANCELLED]: 'Cancelled',
};
