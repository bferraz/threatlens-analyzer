/**
 * API Request and Response types for ThreatLens API
 */

// Base request types
export type InputType = "image" | "mermaid";
export type AnalysisDepth = "quick" | "full";
export type ReportFormat = "markdown" | "pdf";

// Request payload types
interface BaseAnalysisRequestPayload {
  inputType: InputType;
  analysisDepth: AnalysisDepth;
  reportFormat: ReportFormat;
  includeSeverity: boolean;
  includeAssumptions: boolean;
}

interface MermaidAnalysisRequestPayload extends BaseAnalysisRequestPayload {
  inputType: "mermaid";
  mermaidText: string;
}

interface ImageAnalysisRequestPayload extends BaseAnalysisRequestPayload {
  inputType: "image";
  imageData: string; // base64 encoded
  imageFileName: string;
}

export type AnalysisRequestPayload =
  | MermaidAnalysisRequestPayload
  | ImageAnalysisRequestPayload;

// Client-side request (before transformation)
interface BaseAnalyzeRequest {
  inputType: InputType;
  analysisDepth: AnalysisDepth;
  reportFormat: ReportFormat;
  includeSeverity: boolean;
  includeAssumptions: boolean;
}

interface MermaidAnalyzeRequest extends BaseAnalyzeRequest {
  inputType: "mermaid";
  mermaidText: string;
  imageFile?: never;
}

interface ImageAnalyzeRequest extends BaseAnalyzeRequest {
  inputType: "image";
  imageFile: File;
  mermaidText?: never;
}

export type AnalyzeRequest = MermaidAnalyzeRequest | ImageAnalyzeRequest;

// API Error response
export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}
