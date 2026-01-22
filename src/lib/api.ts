/**
 * API Layer - Main entry point for API calls
 * Uses service layer based on DEV_MODE configuration
 */

import { AnalysisResult } from "./types";
import { AnalyzeRequest } from "@/types/api.types";
import { API_CONFIG } from "@/config/api.config";
import { apiService } from "@/services/api.service";
import { mockApiService } from "@/services/mock-api.service";

// Re-export types for convenience
export type { AnalyzeRequest } from "@/types/api.types";

/**
 * Get the appropriate API service based on DEV_MODE
 */
const getApiService = () => {
  return API_CONFIG.DEV_MODE ? mockApiService : apiService;
};

/**
 * Analyze architecture diagram
 */
export async function analyzeArchitecture(
  request: AnalyzeRequest,
): Promise<AnalysisResult> {
  const service = getApiService();
  return service.analyzeArchitecture(request);
}

/**
 * Download analysis report
 */
export async function downloadReport(url: string): Promise<Blob> {
  const service = getApiService();
  return service.downloadReport(url);
}
