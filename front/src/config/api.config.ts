/**
 * API Configuration
 */

export const API_CONFIG = {
  BASE_URL: "http://localhost:5000",
  ENDPOINTS: {
    ANALYZE_IMAGE: "/api/analyze/image",
    ANALYZE_MERMAID: "/api/analyze/mermaid",
    DOWNLOAD_REPORT: "/api/report/download",
  },
  TIMEOUT: 600000, // 10 minutes - GPT-5.2 needs time for detailed analysis
} as const;

export const HTTP_HEADERS = {
  CONTENT_TYPE_JSON: "application/json",
} as const;
