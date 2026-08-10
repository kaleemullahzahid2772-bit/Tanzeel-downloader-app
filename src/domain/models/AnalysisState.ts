export const AnalysisState = {
  IDLE: 'IDLE',
  VALIDATING: 'VALIDATING',
  ANALYZING: 'ANALYZING',
  ANALYZED: 'ANALYZED',
  ERROR: 'ERROR',
} as const;

export type AnalysisState = typeof AnalysisState[keyof typeof AnalysisState];
