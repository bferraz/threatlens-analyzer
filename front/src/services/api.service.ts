/**
 * API Service Layer
 * Handles all HTTP requests to the backend API
 */

import { AnalysisResult } from "@/lib/types";
import { AnalyzeRequest, ApiErrorResponse } from "@/types/api.types";
import { API_CONFIG, HTTP_HEADERS } from "@/config/api.config";

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_CONFIG.BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Analyze architecture diagram
   */
  async analyzeArchitecture(request: AnalyzeRequest): Promise<AnalysisResult> {
    if (request.inputType === "mermaid") {
      return this.analyzeMermaid(request);
    } else {
      return this.analyzeImage(request);
    }
  }

  /**
   * Analyze Mermaid diagram
   */
  private async analyzeMermaid(
    request: AnalyzeRequest & { inputType: "mermaid" },
  ): Promise<AnalysisResult> {
    const payload = {
      mermaidCode: request.mermaidText,
      analysisDepth: request.analysisDepth,
      reportFormat: request.reportFormat,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    try {
      const response = await fetch(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.ANALYZE_MERMAID}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await this.handleErrorResponse(response);
        throw new Error(error.message);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if ((error as Error).name === "AbortError") {
        throw new Error(
          "Request timeout - Analysis is taking longer than expected. Please try again.",
        );
      }
      throw error;
    }
  }

  /**
   * Analyze image diagram
   */
  private async analyzeImage(
    request: AnalyzeRequest & { inputType: "image" },
  ): Promise<AnalysisResult> {
    const formData = new FormData();
    formData.append("file", request.imageFile);
    formData.append("analysisDepth", request.analysisDepth);
    formData.append("reportFormat", request.reportFormat);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    try {
      const response = await fetch(
        `${this.baseUrl}${API_CONFIG.ENDPOINTS.ANALYZE_IMAGE}`,
        {
          method: "POST",
          body: formData,
          signal: controller.signal,
          // Note: não adicionar Content-Type header, deixar o browser definir com boundary
        },
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await this.handleErrorResponse(response);
        throw new Error(error.message);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if ((error as Error).name === "AbortError") {
        throw new Error(
          "Request timeout - Analysis is taking longer than expected. Please try again or use a simpler diagram.",
        );
      }
      throw error;
    }
  }

  /**
   * Download report
   */
  async downloadReport(reportUrl: string): Promise<Blob> {
    // Se reportUrl já é a URL completa, usa direto
    // Se não, constrói a URL completa
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
