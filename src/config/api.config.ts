/**
 * API Configuration
 */

export const API_CONFIG = {
  BASE_URL: "http://localhost:5000/api",
  ENDPOINTS: {
    ANALYZE: "/analyze",
    DOWNLOAD_REPORT: "/report/download",
  },
  TIMEOUT: 30000, // 30 seconds
  DEV_MODE: true, // Toggle for mock vs real API
} as const;

export const HTTP_HEADERS = {
  CONTENT_TYPE_JSON: "application/json",
} as const;
