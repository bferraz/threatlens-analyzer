import {
  SavedAnalysis,
  AnalysisSummary,
  ThreatCheck,
  MitigationCheck,
} from "@/lib/types";

/**
 * Mock service for saved analyses management
 * This will be replaced with actual API calls to MongoDB backend
 */

// Mock data storage (in-memory for now)
let mockAnalyses: SavedAnalysis[] = [
  {
    id: "1",
    name: "E-commerce Platform Analysis",
    description: "Security analysis for the main e-commerce architecture",
    diagramType: "mermaid",
    diagramData: `graph TD
    User[User] -->|HTTPS| API[API Gateway]
    API -->|gRPC| Service[Backend Service]
    Service -->|SQL| DB[(Database)]`,
    analysisResult: {
      components: [
        {
          id: "user-1",
          type: "Actor",
          name: "User",
          trust_zone: "external",
          confidence: 0.95,
        },
        {
          id: "api-1",
          type: "Service",
          name: "API Gateway",
          trust_zone: "dmz",
          confidence: 0.98,
        },
        {
          id: "service-1",
          type: "Service",
          name: "Backend Service",
          trust_zone: "internal",
          confidence: 0.97,
        },
        {
          id: "db-1",
          type: "Database",
          name: "Database",
          trust_zone: "private",
          confidence: 0.99,
        },
      ],
      data_flows: [
        {
          from: "user-1",
          to: "api-1",
          protocol: "HTTPS",
          direction: "bidirectional",
          data_types: ["credentials", "user data"],
          confidence: 0.95,
        },
        {
          from: "api-1",
          to: "service-1",
          protocol: "gRPC",
          direction: "bidirectional",
          data_types: ["requests"],
          confidence: 0.96,
        },
        {
          from: "service-1",
          to: "db-1",
          protocol: "SQL",
          direction: "bidirectional",
          data_types: ["queries", "data"],
          confidence: 0.98,
        },
      ],
      threats: [
        {
          targetId: "api-1",
          category: "S",
          title: "API Key Spoofing",
          description:
            "Attacker could spoof API keys to impersonate legitimate clients",
          severity: "high",
        },
        {
          targetId: "db-1",
          category: "I",
          title: "SQL Injection",
          description:
            "Potential SQL injection vulnerabilities in database queries",
          severity: "critical",
        },
        {
          targetId: "service-1",
          category: "D",
          title: "Rate Limiting Missing",
          description: "No rate limiting could lead to DoS attacks",
          severity: "medium",
        },
        {
          targetId: "api-1",
          category: "T",
          title: "Data Tampering",
          description: "Lack of request signing allows data tampering",
          severity: "high",
        },
      ],
      mitigations: [
        {
          targetId: "api-1",
          title: "Implement OAuth 2.0 with JWT",
          steps: [
            "Configure OAuth provider",
            "Implement JWT validation",
            "Add token refresh mechanism",
          ],
        },
        {
          targetId: "db-1",
          title: "Use Parameterized Queries",
          steps: [
            "Replace string concatenation with parameterized queries",
            "Use ORM for database access",
            "Enable SQL injection detection",
          ],
        },
        {
          targetId: "service-1",
          title: "Implement Rate Limiting",
          steps: [
            "Add Redis for rate limiting",
            "Configure rate limits per endpoint",
            "Implement exponential backoff",
          ],
        },
      ],
      assumptions: [
        "HTTPS is properly configured",
        "Database uses encryption at rest",
      ],
      uncertainties: ["Authentication mechanism not clearly specified"],
      reportDownloadUrl: "/api/report/download/1",
    },
    threatChecks: [
      {
        threatId: "api-1-S",
        isResolved: true,
        resolvedAt: "2026-01-20T10:30:00Z",
        notes: "Implemented OAuth 2.0",
      },
      { threatId: "db-1-I", isResolved: false },
      { threatId: "service-1-D", isResolved: false },
      {
        threatId: "api-1-T",
        isResolved: true,
        resolvedAt: "2026-01-22T14:15:00Z",
        notes: "Added HMAC signing",
      },
    ],
    mitigationChecks: [
      // OAuth 2.0 with JWT - 3 steps (2 completed)
      {
        mitigationId: "api-1-implement-oauth-2.0-with-jwt-step-0",
        stepIndex: 0,
        isCompleted: true,
        completedAt: "2026-01-20T10:30:00Z",
        notes: "OAuth provider configured",
      },
      {
        mitigationId: "api-1-implement-oauth-2.0-with-jwt-step-1",
        stepIndex: 1,
        isCompleted: true,
        completedAt: "2026-01-20T10:30:00Z",
        notes: "JWT validation implemented",
      },
      // Parameterized Queries - 3 steps (none completed)
      // Rate Limiting - 3 steps (none completed)
    ],
    createdAt: "2026-01-15T09:00:00Z",
    updatedAt: "2026-01-22T14:15:00Z",
    tags: ["e-commerce", "production", "high-priority"],
  },
  {
    id: "2",
    name: "Mobile App Backend",
    description: "Analysis of mobile application backend services",
    diagramType: "image",
    analysisResult: {
      components: [
        {
          id: "mobile-1",
          type: "Actor",
          name: "Mobile App",
          trust_zone: "external",
          confidence: 0.92,
        },
        {
          id: "api-2",
          type: "Service",
          name: "REST API",
          trust_zone: "dmz",
          confidence: 0.95,
        },
        {
          id: "auth-1",
          type: "Service",
          name: "Auth Service",
          trust_zone: "internal",
          confidence: 0.97,
        },
      ],
      data_flows: [
        {
          from: "mobile-1",
          to: "api-2",
          protocol: "HTTPS",
          direction: "bidirectional",
          data_types: ["requests"],
          confidence: 0.9,
        },
        {
          from: "api-2",
          to: "auth-1",
          protocol: "HTTP",
          direction: "bidirectional",
          data_types: ["tokens"],
          confidence: 0.88,
        },
      ],
      threats: [
        {
          targetId: "api-2",
          category: "S",
          title: "Token Theft",
          description: "JWT tokens could be intercepted",
          severity: "critical",
        },
        {
          targetId: "auth-1",
          category: "E",
          title: "Privilege Escalation",
          description: "Missing role validation",
          severity: "high",
        },
      ],
      mitigations: [
        {
          targetId: "api-2",
          title: "Implement Token Encryption",
          steps: ["Use encrypted tokens", "Add token rotation"],
        },
        {
          targetId: "auth-1",
          title: "Role-Based Access Control",
          steps: ["Implement RBAC", "Add permission checks"],
        },
      ],
      assumptions: ["Mobile app uses certificate pinning"],
      uncertainties: ["Token expiration policy unclear"],
      reportDownloadUrl: "/api/report/download/2",
    },
    threatChecks: [
      { threatId: "api-2-S", isResolved: false },
      { threatId: "auth-1-E", isResolved: false },
    ],
    mitigationChecks: [
      // Token Encryption - 2 steps (none completed)
      // RBAC - 2 steps (none completed)
    ],
    createdAt: "2026-01-18T14:30:00Z",
    updatedAt: "2026-01-18T14:30:00Z",
    tags: ["mobile", "backend"],
  },
  {
    id: "3",
    name: "Microservices Architecture",
    description: "Security review of microservices deployment",
    diagramType: "mermaid",
    analysisResult: {
      components: [
        {
          id: "gateway-1",
          type: "Service",
          name: "API Gateway",
          trust_zone: "dmz",
          confidence: 0.96,
        },
        {
          id: "service-a",
          type: "Service",
          name: "Service A",
          trust_zone: "internal",
          confidence: 0.94,
        },
        {
          id: "service-b",
          type: "Service",
          name: "Service B",
          trust_zone: "internal",
          confidence: 0.94,
        },
        {
          id: "message-queue",
          type: "Service",
          name: "Message Queue",
          trust_zone: "internal",
          confidence: 0.93,
        },
      ],
      data_flows: [
        {
          from: "gateway-1",
          to: "service-a",
          protocol: "HTTP",
          direction: "bidirectional",
          data_types: ["requests"],
          confidence: 0.9,
        },
        {
          from: "service-a",
          to: "message-queue",
          protocol: "AMQP",
          direction: "unidirectional",
          data_types: ["events"],
          confidence: 0.92,
        },
        {
          from: "message-queue",
          to: "service-b",
          protocol: "AMQP",
          direction: "unidirectional",
          data_types: ["events"],
          confidence: 0.92,
        },
      ],
      threats: [
        {
          targetId: "message-queue",
          category: "I",
          title: "Message Interception",
          description: "Unencrypted messages in queue",
          severity: "high",
        },
        {
          targetId: "service-a",
          category: "R",
          title: "No Audit Logging",
          description: "Actions cannot be traced",
          severity: "medium",
        },
        {
          targetId: "gateway-1",
          category: "D",
          title: "No Circuit Breaker",
          description: "Cascade failures possible",
          severity: "medium",
        },
      ],
      mitigations: [
        {
          targetId: "message-queue",
          title: "Enable Message Encryption",
          steps: ["Configure TLS for AMQP", "Encrypt message payloads"],
        },
        {
          targetId: "service-a",
          title: "Implement Audit Logging",
          steps: ["Add logging framework", "Store logs centrally"],
        },
        {
          targetId: "gateway-1",
          title: "Add Circuit Breaker",
          steps: [
            "Implement Hystrix/Resilience4j",
            "Configure fallback mechanisms",
          ],
        },
      ],
      assumptions: ["Services run in isolated containers"],
      uncertainties: ["Network policies not documented"],
      reportDownloadUrl: "/api/report/download/3",
    },
    threatChecks: [
      {
        threatId: "message-queue-I",
        isResolved: true,
        resolvedAt: "2026-01-25T11:00:00Z",
      },
      { threatId: "service-a-R", isResolved: false },
      { threatId: "gateway-1-D", isResolved: false },
    ],
    mitigationChecks: [
      // Message Encryption - 2 steps (both completed)
      {
        mitigationId: "message-queue-enable-message-encryption-step-0",
        stepIndex: 0,
        isCompleted: true,
        completedAt: "2026-01-25T11:00:00Z",
        notes: "TLS configured for AMQP",
      },
      {
        mitigationId: "message-queue-enable-message-encryption-step-1",
        stepIndex: 1,
        isCompleted: true,
        completedAt: "2026-01-25T11:00:00Z",
        notes: "Message payloads encrypted",
      },
      // Audit Logging - 2 steps (none completed)
      // Circuit Breaker - 2 steps (none completed)
    ],
    createdAt: "2026-01-10T08:00:00Z",
    updatedAt: "2026-01-25T11:00:00Z",
    tags: ["microservices", "kubernetes", "production"],
  },
];

export class SavedAnalysesService {
  /**
   * Get all saved analyses (summary view)
   */
  static async getAllAnalyses(): Promise<AnalysisSummary[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return mockAnalyses.map((analysis) => ({
      id: analysis.id,
      name: analysis.name,
      description: analysis.description,
      diagramType: analysis.diagramType,
      createdAt: analysis.createdAt,
      updatedAt: analysis.updatedAt,
      tags: analysis.tags,
      stats: {
        totalThreats: analysis.analysisResult.threats.length,
        resolvedThreats: analysis.threatChecks.filter((c) => c.isResolved)
          .length,
        criticalThreats: analysis.analysisResult.threats.filter(
          (t) => t.severity === "critical",
        ).length,
        totalMitigations: analysis.analysisResult.mitigations.reduce(
          (acc, m) => acc + m.steps.length,
          0,
        ),
        completedMitigations: analysis.mitigationChecks.filter(
          (c) => c.isCompleted,
        ).length,
      },
    }));
  }

  /**
   * Get a specific analysis by ID
   */
  static async getAnalysisById(id: string): Promise<SavedAnalysis | null> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    return mockAnalyses.find((a) => a.id === id) || null;
  }

  /**
   * Save a new analysis
   */
  static async saveAnalysis(
    analysis: Omit<SavedAnalysis, "id" | "createdAt" | "updatedAt">,
  ): Promise<SavedAnalysis> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    const newAnalysis: SavedAnalysis = {
      ...analysis,
      id: String(mockAnalyses.length + 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockAnalyses.push(newAnalysis);
    return newAnalysis;
  }

  /**
   * Update threat check status
   */
  static async updateThreatCheck(
    analysisId: string,
    threatId: string,
    update: Partial<ThreatCheck>,
  ): Promise<void> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const analysis = mockAnalyses.find((a) => a.id === analysisId);
    if (!analysis) throw new Error("Analysis not found");

    const checkIndex = analysis.threatChecks.findIndex(
      (c) => c.threatId === threatId,
    );

    if (checkIndex >= 0) {
      analysis.threatChecks[checkIndex] = {
        ...analysis.threatChecks[checkIndex],
        ...update,
      };
    } else {
      analysis.threatChecks.push({
        threatId,
        isResolved: false,
        ...update,
      });
    }

    analysis.updatedAt = new Date().toISOString();
  }

  /**
   * Update mitigation check status
   */
  static async updateMitigationCheck(
    analysisId: string,
    mitigationId: string,
    update: Partial<MitigationCheck>,
  ): Promise<void> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const analysis = mockAnalyses.find((a) => a.id === analysisId);
    if (!analysis) throw new Error("Analysis not found");

    const checkIndex = analysis.mitigationChecks.findIndex(
      (c) => c.mitigationId === mitigationId,
    );

    if (checkIndex >= 0) {
      analysis.mitigationChecks[checkIndex] = {
        ...analysis.mitigationChecks[checkIndex],
        ...update,
      };
    } else {
      analysis.mitigationChecks.push({
        mitigationId,
        isCompleted: false,
        ...update,
      });
    }

    analysis.updatedAt = new Date().toISOString();
  }

  /**
   * Delete an analysis
   */
  static async deleteAnalysis(id: string): Promise<void> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    mockAnalyses = mockAnalyses.filter((a) => a.id !== id);
  }

  /**
   * Update analysis metadata (name, description, tags)
   */
  static async updateAnalysisMetadata(
    id: string,
    updates: { name?: string; description?: string; tags?: string[] },
  ): Promise<void> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const analysis = mockAnalyses.find((a) => a.id === id);
    if (!analysis) throw new Error("Analysis not found");

    if (updates.name) analysis.name = updates.name;
    if (updates.description !== undefined)
      analysis.description = updates.description;
    if (updates.tags) analysis.tags = updates.tags;

    analysis.updatedAt = new Date().toISOString();
  }
}
