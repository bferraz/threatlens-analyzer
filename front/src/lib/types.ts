export interface Component {
  id: string;
  type: string;
  name: string;
  trust_zone:
    | "external"
    | "dmz"
    | "internal"
    | "private"
    | "internet"
    | "public";
  confidence: number;
}

export interface DataFlow {
  from: string;
  to: string;
  protocol: string;
  direction: "unidirectional" | "bidirectional";
  data_types: string[];
  confidence: number;
}

export type StrideCategory = "S" | "T" | "R" | "I" | "D" | "E";

export interface Threat {
  targetId: string;
  category: StrideCategory;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
}

export interface Mitigation {
  targetId: string;
  title: string;
  steps: string[];
}

export interface AnalysisResult {
  components: Component[];
  data_flows: DataFlow[];
  threats: Threat[];
  mitigations: Mitigation[];
  assumptions: string[];
  uncertainties: string[];
  reportDownloadUrl: string;
}

export const STRIDE_LABELS: Record<StrideCategory, string> = {
  S: "Spoofing",
  T: "Tampering",
  R: "Repudiation",
  I: "Information Disclosure",
  D: "Denial of Service",
  E: "Elevation of Privilege",
};

export const STRIDE_COLORS: Record<StrideCategory, string> = {
  S: "stride-s",
  T: "stride-t",
  R: "stride-r",
  I: "stride-i",
  D: "stride-d",
  E: "stride-e",
};

// Types for saved analyses and checks
export interface ThreatCheck {
  threatId: string;
  isResolved: boolean;
  resolvedAt?: string;
  notes?: string;
}

export interface MitigationCheck {
  mitigationId: string;
  stepIndex?: number; // Optional for individual step tracking
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
}

export interface SavedAnalysis {
  id: string;
  name: string;
  description?: string;
  diagramType: "image" | "mermaid";
  diagramData?: string; // base64 for image or mermaid code
  analysisResult: AnalysisResult;
  threatChecks: ThreatCheck[];
  mitigationChecks: MitigationCheck[];
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface AnalysisSummary {
  id: string;
  name: string;
  description?: string;
  diagramType: "image" | "mermaid";
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  stats: {
    totalThreats: number;
    resolvedThreats: number;
    criticalThreats: number;
    totalMitigations: number;
    completedMitigations: number;
  };
}
