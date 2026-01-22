/**
 * API Service Layer
 * Handles all HTTP requests to the backend API
 */

import { AnalysisResult } from "@/lib/types";
import {
  AnalyzeRequest,
  AnalysisRequestPayload,
  ApiErrorResponse,
} from "@/types/api.types";
import { API_CONFIG, HTTP_HEADERS } from "@/config/api.config";
import { convertFileToBase64 } from "@/utils/file.utils";

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_CONFIG.BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Transform client request to API payload
   */
  private async transformRequest(
    request: AnalyzeRequest,
  ): Promise<AnalysisRequestPayload> {
    const basePayload = {
      analysisDepth: request.analysisDepth,
      reportFormat: request.reportFormat,
      includeSeverity: request.includeSeverity,
      includeAssumptions: request.includeAssumptions,
    };

    if (request.inputType === "mermaid") {
      return {
        ...basePayload,
        inputType: "mermaid",
        mermaidText: request.mermaidText,
      };
    }

    // Image type
    const imageData = await convertFileToBase64(request.imageFile);
    return {
      ...basePayload,
      inputType: "image",
      imageData,
      imageFileName: request.imageFile.name,
    };
  }

  /**
   * Analyze architecture diagram
   */
  async analyzeArchitecture(request: AnalyzeRequest): Promise<AnalysisResult> {
    const payload = await this.transformRequest(request);

    const response = await fetch(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.ANALYZE}`,
      {
        method: "POST",
        headers: {
          [HTTP_HEADERS.CONTENT_TYPE_JSON]: HTTP_HEADERS.CONTENT_TYPE_JSON,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const error = await this.handleErrorResponse(response);
      throw new Error(error.message);
    }

    return response.json();
  }

  /**
   * Download report
   */
  async downloadReport(reportUrl: string): Promise<Blob> {
    const fullUrl = reportUrl.startsWith("http")
      ? reportUrl
      : `${this.baseUrl}${reportUrl}`;

    const response = await fetch(fullUrl);

    if (!response.ok) {
      throw new Error("Failed to download report");
    }

    return response.blob();
  }

  /**
   * Handle error responses
   */
  private async handleErrorResponse(
    response: Response,
  ): Promise<ApiErrorResponse> {
    try {
      const errorData = await response.json();
      return {
        error: errorData.error || "API Error",
        message: errorData.message || response.statusText,
        statusCode: response.status,
      };
    } catch {
      return {
        error: "Request Failed",
        message: response.statusText || "Unknown error occurred",
        statusCode: response.status,
      };
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
