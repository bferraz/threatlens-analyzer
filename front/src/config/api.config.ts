/**
 * API Configuration
 */

export const API_CONFIG = {
  BASE_URL: "http://localhost:5000",
  ENDPOINTS: {
    ANALYZE_IMAGE: "/api/analyze/image",
    ANALYZE_MERMAID: "/api/analyze/mermaid",
    DOWNLOAD_REPORT: "/api/report/download",
    // Saved analyses endpoints
    ANALYSES: "/api/analyses",
    ANALYSIS_BY_ID: (id: string) => `/api/analyses/${id}`,
    UPDATE_THREAT_CHECK: (analysisId: string, threatId: string) =>
      `/api/analyses/${analysisId}/threats/${threatId}`,
    UPDATE_MITIGATION_CHECK: (analysisId: string, mitigationId: string) =>
      `/api/analyses/${analysisId}/mitigations/${mitigationId}`,
  },
  TIMEOUT: 600000, // 10 minutes - GPT-5.2 needs time for detailed analysis
} as const;

export const HTTP_HEADERS = {
  CONTENT_TYPE_JSON: "application/json",
} as const;
