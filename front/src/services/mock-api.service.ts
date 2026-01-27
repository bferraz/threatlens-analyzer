/**
 * Mock data service for development
 */

import { AnalysisResult } from "@/lib/types";
import { AnalyzeRequest } from "@/types/api.types";

const MOCK_DELAY = 2500; // 2.5 seconds

export const mockAnalysisResult: AnalysisResult = {
  components: [
    {
      id: "user",
      type: "external",
      name: "User",
      trust_zone: "external",
      confidence: 0.95,
    },
    {
      id: "apigw",
      type: "gateway",
      name: "API Gateway",
      trust_zone: "dmz",
      confidence: 0.92,
    },
    {
      id: "api",
      type: "service",
      name: "Backend API",
      trust_zone: "internal",
      confidence: 0.98,
    },
    {
      id: "db",
      type: "database",
      name: "Database",
      trust_zone: "internal",
      confidence: 0.96,
    },
    {
      id: "auth",
      type: "service",
      name: "Identity Provider",
      trust_zone: "internal",
      confidence: 0.94,
    },
  ],
  data_flows: [
    {
      from: "user",
      to: "apigw",
      protocol: "HTTPS",
      direction: "bidirectional",
      data_types: ["credentials", "requests"],
      confidence: 0.93,
    },
    {
      from: "apigw",
      to: "api",
      protocol: "HTTPS",
      direction: "bidirectional",
      data_types: ["api_requests", "tokens"],
      confidence: 0.91,
    },
    {
      from: "api",
      to: "db",
      protocol: "TCP",
      direction: "bidirectional",
      data_types: ["queries", "user_data"],
      confidence: 0.97,
    },
    {
      from: "api",
      to: "auth",
      protocol: "HTTPS",
      direction: "bidirectional",
      data_types: ["auth_tokens", "user_claims"],
      confidence: 0.89,
    },
  ],
  threats: [
    // Spoofing
    {
      targetId: "user",
      category: "S",
      title: "Identity Spoofing",
      description:
        "Attacker may impersonate legitimate users by stealing or forging credentials",
      severity: "high",
    },
    {
      targetId: "apigw",
      category: "S",
      title: "API Key Theft",
      description: "Compromised API keys could allow unauthorized API access",
      severity: "medium",
    },
    // Tampering
    {
      targetId: "api",
      category: "T",
      title: "Request Tampering",
      description: "Malicious modification of API requests in transit",
      severity: "high",
    },
    {
      targetId: "db",
      category: "T",
      title: "Data Modification",
      description: "Unauthorized modification of database records",
      severity: "high",
    },
    // Repudiation
    {
      targetId: "api",
      category: "R",
      title: "Action Repudiation",
      description:
        "Users may deny performing actions without proper audit logging",
      severity: "medium",
    },
    // Information Disclosure
    {
      targetId: "db",
      category: "I",
      title: "Data Leakage",
      description: "Sensitive data exposure through improper access controls",
      severity: "high",
    },
    {
      targetId: "api",
      category: "I",
      title: "Error Information Leak",
      description: "Verbose error messages may reveal system internals",
      severity: "low",
    },
    // Denial of Service
    {
      targetId: "apigw",
      category: "D",
      title: "Rate Limit Bypass",
      description: "Attackers may overwhelm the API gateway with requests",
      severity: "medium",
    },
    {
      targetId: "db",
      category: "D",
      title: "Resource Exhaustion",
      description: "Malicious queries could exhaust database resources",
      severity: "medium",
    },
    // Elevation of Privilege
    {
      targetId: "auth",
      category: "E",
      title: "Privilege Escalation",
      description: "Users may gain unauthorized access to admin functions",
      severity: "high",
    },
    {
      targetId: "api",
      category: "E",
      title: "IDOR Vulnerability",
      description:
        "Insecure direct object references allowing access to other users' data",
      severity: "high",
    },
  ],
  mitigations: [
    {
      targetId: "user",
      title: "Implement Multi-Factor Authentication",
      steps: [
        "Enable MFA for all user accounts",
        "Use hardware tokens or authenticator apps",
        "Implement step-up authentication for sensitive operations",
      ],
    },
    {
      targetId: "apigw",
      title: "API Gateway Hardening",
      steps: [
        "Implement rate limiting and throttling",
        "Use API key rotation policies",
        "Enable request validation and sanitization",
        "Configure WAF rules",
      ],
    },
    {
      targetId: "api",
      title: "Secure API Development",
      steps: [
        "Use parameterized queries",
        "Implement input validation",
        "Enable audit logging",
        "Use proper error handling",
      ],
    },
    {
      targetId: "db",
      title: "Database Security",
      steps: [
        "Enable encryption at rest",
        "Use least-privilege access",
        "Implement connection pooling limits",
        "Enable query auditing",
      ],
    },
    {
      targetId: "auth",
      title: "Identity Provider Security",
      steps: [
        "Implement proper session management",
        "Use secure token storage",
        "Enable brute force protection",
        "Regular security audits",
      ],
    },
  ],
  assumptions: [
    "All communication channels use TLS 1.3 or higher",
    "The API Gateway is properly configured with security policies",
    "Database credentials are stored securely using a secrets manager",
  ],
  uncertainties: [
    "The exact authentication mechanism (OAuth, SAML, etc.) is not specified",
    "Network segmentation details are not visible in the diagram",
    "Third-party service integrations may exist but are not shown",
  ],
  reportDownloadUrl: "/api/report/download/mock-report-123",
};

class MockApiService {
  async analyzeArchitecture(request: AnalyzeRequest): Promise<AnalysisResult> {
    console.log("[DEV MODE] Using mock analysis data");
    console.log("Request:", request);

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockAnalysisResult);
      }, MOCK_DELAY);
    });
  }

  async downloadReport(url: string): Promise<Blob> {
    const mockReport = `# ThreatLens Security Report

## Executive Summary
This report contains the STRIDE threat analysis for the analyzed architecture.

## Components Identified
- User (External)
- API Gateway (DMZ)
- Backend API (Internal)
- Database (Internal)
- Identity Provider (Internal)

## Threats Found
- 11 threats identified across all STRIDE categories
- 5 High severity
- 4 Medium severity
- 2 Low severity

## Recommendations
See detailed mitigations in the full report.

---
Generated by ThreatLens
`;
    return new Blob([mockReport], { type: "text/markdown" });
  }
}

export const mockApiService = new MockApiService();
