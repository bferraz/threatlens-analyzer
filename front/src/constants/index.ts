/**
 * Constants used throughout the application
 */

export const STRIDE_CATEGORIES = {
  S: "Spoofing",
  T: "Tampering",
  R: "Repudiation",
  I: "Information Disclosure",
  D: "Denial of Service",
  E: "Elevation of Privilege",
} as const;

export const SEVERITY_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;

export const COMPONENT_TYPES = {
  EXTERNAL: "external",
  GATEWAY: "gateway",
  SERVICE: "service",
  DATABASE: "database",
  QUEUE: "queue",
  CACHE: "cache",
} as const;

export const TRUST_ZONES = {
  EXTERNAL: "external",
  DMZ: "dmz",
  INTERNAL: "internal",
} as const;

export const DATA_FLOW_DIRECTIONS = {
  UNIDIRECTIONAL: "unidirectional",
  BIDIRECTIONAL: "bidirectional",
} as const;
