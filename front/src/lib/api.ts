/**
 * API Layer - Main entry point for API calls
 */

import { AnalysisResult } from "./types";
import { AnalyzeRequest } from "@/types/api.types";
import { apiService } from "@/services/api.service";

// Re-export types for convenience
export type { AnalyzeRequest } from "@/types/api.types";

/**
 * Analyze architecture diagram
 */
export async function analyzeArchitecture(
  request: AnalyzeRequest,
): Promise<AnalysisResult> {
  return apiService.analyzeArchitecture(request);
}

/**
 * Download analysis report
 */
export async function downloadReport(url: string): Promise<Blob> {
  return apiService.downloadReport(url);
}
