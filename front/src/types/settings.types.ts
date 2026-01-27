/**
 * Analysis settings types
 */

import { AnalysisDepth, ReportFormat } from "./api.types";

export interface AnalysisSettings {
  analysisDepth: AnalysisDepth;
  reportFormat: ReportFormat;
  includeSeverity: boolean;
  includeAssumptions: boolean;
}
