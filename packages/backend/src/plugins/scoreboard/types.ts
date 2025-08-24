// packages/backend/src/plugins/scoreboard/types.ts
// or create a shared package: packages/scoreboard-common/src/types.ts

export interface EntityScore {
  name: string;
  kind: string;
  owner: string;
  reviewer: string;
  date: string;
  bugs: string;
  documentation: string;
  vulnerabilities: string;
  codeSmells: string;
  duplications: string;
  total: string;
}

export interface SonarCloudMetrics {
  bugs: number;
  vulnerabilities: number;
  code_smells: number;
  coverage: number;
  duplicated_lines_density: number;
  reliability_rating: number;
  security_rating: number;
  sqale_rating: number;
}

export interface ScoreboardConfig {
  baseUrl?: string;
  refreshInterval?: number;
}