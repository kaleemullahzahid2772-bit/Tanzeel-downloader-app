import type { PlatformAnalysisResult } from '../models/PlatformAnalysisResult';

export interface IVideoSourceAnalyzer {
  analyze(rawUrl: string): Promise<PlatformAnalysisResult>;
}
