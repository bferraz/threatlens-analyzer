import { API_CONFIG } from "@/config/api.config";
import type {
  SavedAnalysis,
  AnalysisSummary,
  ThreatCheck,
  MitigationCheck,
  AnalysisResult,
} from "@/lib/types";

export class RealAnalysesService {
  private static baseUrl = API_CONFIG.BASE_URL;

  /**
   * Save a new analysis
   */
  static async saveAnalysis(data: {
    name: string;
    description?: string;
    diagramType: "mermaid" | "image";
    diagramContent?: string;
    analysisResult: AnalysisResult;
    tags?: string[];
  }): Promise<{ id: string; message: string }> {
    const response = await fetch(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.ANALYSES}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to save analysis");
    }

    return response.json();
  }

  /**
   * Get all analyses
   */
  static async getAllAnalyses(params?: {
    search?: string;
    tags?: string;
  }): Promise<AnalysisSummary[]> {
    const queryParams = new URLSearchParams();

    if (params?.search) {
      queryParams.append("search", params.search);
    }

    if (params?.tags) {
      queryParams.append("tags", params.tags);
    }

    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.ANALYSES}?${queryParams.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch analyses");
    }

    return response.json();
  }

  /**
   * Get a specific analysis by ID
   */
  static async getAnalysisById(id: string): Promise<SavedAnalysis> {
    const response = await fetch(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.ANALYSIS_BY_ID(id)}`,
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Analysis not found");
      }
      throw new Error("Failed to fetch analysis");
    }

    return response.json();
  }

  /**
   * Update a threat check
   */
  static async updateThreatCheck(
    analysisId: string,
    threatId: string,
    data: ThreatCheck,
  ): Promise<{ message: string }> {
    const response = await fetch(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.UPDATE_THREAT_CHECK(analysisId, threatId)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to update threat check");
    }

    return response.json();
  }

  /**
   * Update a mitigation check
   */
  static async updateMitigationCheck(
    analysisId: string,
    mitigationId: string,
    data: MitigationCheck,
  ): Promise<{ message: string }> {
    const response = await fetch(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.UPDATE_MITIGATION_CHECK(analysisId, mitigationId)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to update mitigation check");
    }

    return response.json();
  }

  /**
   * Delete an analysis
   */
  static async deleteAnalysis(id: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.ANALYSIS_BY_ID(id)}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to delete analysis");
    }
  }

  /**
   * Download report for an analysis
   */
  static async downloadReport(id: string): Promise<Blob> {
    const response = await fetch(
      `${this.baseUrl}${API_CONFIG.ENDPOINTS.ANALYSIS_BY_ID(id)}/report`,
    );

    if (!response.ok) {
      throw new Error("Failed to download report");
    }

    return response.blob();
  }
}
