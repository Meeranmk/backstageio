import { Config } from '@backstage/config';
import { CatalogClient, CATALOG_FILTER_EXISTS } from '@backstage/catalog-client';
import { Entity } from '@backstage/catalog-model';
import { DiscoveryApi } from '@backstage/core-plugin-api';
import { AuthService } from '@backstage/backend-plugin-api';
import express from 'express';
import { Router } from 'express';

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

export interface RouterOptions {
  config: Config;
  discovery: DiscoveryApi;
  auth: AuthService;
}

export class SonarCloudScoreboardService {
  private readonly baseUrl: string ;
  private readonly apiKey: string ; // move to config or secrets in production
  private readonly authType: string ;

  // NEW: weights for weighted average
  private readonly weights = {
    bugs: 0.25,
    documentation: 0.15,
    vulnerabilities: 0.25,
    codeSmells: 0.20,
    duplications: 0.15,
  };

  constructor(private config: Config) {
    this.baseUrl = config.getString('sonarcloud.baseUrl');
    this.apiKey = config.getString('sonarcloud.apiKey');
    this.authType = config.getString('sonarcloud.authType');
  }

  async computeScores(entities: Entity[]): Promise<EntityScore[]> {
    try {
      console.log(`Processing ${entities.length} entities from catalog`);

      const scores = await Promise.all(
        entities.map(entity => this.getSonarCloudScore(entity)),
      );

      const validScores = scores.filter(Boolean) as EntityScore[];
      console.log(`Generated ${validScores.length} valid scores`);

      return validScores;
    } catch (error) {
      console.error('Failed to compute scores:', error);
      throw error;
    }
  }

  private async getSonarCloudScore(
    entity: Entity,
  ): Promise<EntityScore | null> {
    const projectKey = entity.metadata.annotations?.['sonarcloud.io/project-key'];

    if (!projectKey) {
      console.log(
        `No SonarCloud project key found for entity: ${entity.metadata.name}`,
      );
      return null;
    }

    console.log(`Fetching SonarCloud data for project: ${projectKey}`);

    try {
      const metricsResponse = await fetch(
        `${this.baseUrl}/api/measures/component?component=${encodeURIComponent(
          projectKey,
        )}&metricKeys=bugs,vulnerabilities,code_smells,coverage,duplicated_lines_density,reliability_rating,security_rating,sqale_rating`,
        {
          headers: {
            Authorization: `${this.authType} ${this.apiKey}`,
            Accept: 'application/json',
          },
        },
      );

      if (!metricsResponse.ok) {
        console.error(
          `SonarCloud API error for ${projectKey}: ${metricsResponse.status} ${metricsResponse.statusText}`,
        );
        return null;
      }

      const metricsData = await metricsResponse.json();

      if (!metricsData.component || !metricsData.component.measures) {
        console.error(`No metrics data found for project: ${projectKey}`);
        return null;
      }

      return this.transformSonarDataToScore(entity, metricsData, projectKey);
    } catch (error) {
      console.error(
        `Failed to fetch SonarCloud data for ${projectKey}:`,
        error,
      );
      return null;
    }
  }

  private transformSonarDataToScore(
    entity: Entity,
    sonarData: any,
    projectKey: string,
  ): EntityScore {
    const measures = sonarData.component.measures;

    const getMetricValue = (key: string): number => {
      const measure = measures.find((m: any) => m.metric === key);
      return measure ? parseFloat(measure.value) || 0 : 0;
    };

    const bugs = getMetricValue('bugs');
    const vulnerabilities = getMetricValue('vulnerabilities');
    const codeSmells = getMetricValue('code_smells');
    const coverage = getMetricValue('coverage');
    const duplications = getMetricValue('duplicated_lines_density');
    const reliabilityRating = getMetricValue('reliability_rating');
    const securityRating = getMetricValue('security_rating');
    const maintainabilityRating = getMetricValue('sqale_rating');

    console.log(`Metrics for ${projectKey}:`, {
      bugs,
      vulnerabilities,
      codeSmells,
      coverage,
      duplications,
    });

    const bugsScore = this.calculateBugsScore(bugs, reliabilityRating);
    const documentationScore = coverage || 0;
    const vulnerabilitiesScore = this.calculateVulnerabilitiesScore(
      vulnerabilities,
      securityRating,
    );
    const codeSmellsScore = this.calculateCodeSmellsScore(
      codeSmells,
      maintainabilityRating,
    );
    const duplicationsScore = Math.max(0, 100 - duplications);

    const totalScore = this.calculateTotalScore({
      bugsScore,
      documentationScore,
      vulnerabilitiesScore,
      codeSmellsScore,
      duplicationsScore,
    });

    const owner = this.getEntityOwner(entity);

    return {
      name: entity.metadata.name,
      kind: entity.kind,
      owner: owner,
      reviewer: entity.metadata.annotations?.['reviewer'] || 'Meeran',
      date: new Date().toLocaleDateString('en-GB'),
      bugs: `${Math.round(bugsScore)}%`,
      documentation: `${Math.round(documentationScore)}%`,
      vulnerabilities: `${Math.round(vulnerabilitiesScore)}%`,
      codeSmells: `${Math.round(codeSmellsScore)}%`,
      duplications: `${Math.round(duplicationsScore)}%`,
      total: `${Math.round(totalScore)}%`,
    };
  }

  private getEntityOwner(entity: Entity): string {
    return (entity.spec?.owner as string) || 'meeran';
  }

  private calculateBugsScore(bugs: number, reliabilityRating?: number): number {
    if (reliabilityRating) {
      switch (reliabilityRating) {
        case 1: return 95;
        case 2: return 80;
        case 3: return 60;
        case 4: return 40;
        case 5: return 20;
        default: return 50;
      }
    }
    if (bugs === 0) return 100;
    if (bugs <= 5) return 90;
    if (bugs <= 10) return 75;
    if (bugs <= 20) return 50;
    if (bugs <= 50) return 25;
    return 10;
  }

  private calculateVulnerabilitiesScore(
    vulnerabilities: number,
    securityRating?: number,
  ): number {
    if (securityRating) {
      switch (securityRating) {
        case 1: return 95;
        case 2: return 80;
        case 3: return 60;
        case 4: return 40;
        case 5: return 20;
        default: return 50;
      }
    }
    if (vulnerabilities === 0) return 100;
    if (vulnerabilities <= 2) return 85;
    if (vulnerabilities <= 5) return 65;
    if (vulnerabilities <= 10) return 45;
    return 25;
  }

  private calculateCodeSmellsScore(
    codeSmells: number,
    maintainabilityRating?: number,
  ): number {
    if (maintainabilityRating) {
      switch (maintainabilityRating) {
        case 1: return 95;
        case 2: return 80;
        case 3: return 60;
        case 4: return 40;
        case 5: return 20;
        default: return 50;
      }
    }
    if (codeSmells <= 10) return 100;
    if (codeSmells <= 50) return 85;
    if (codeSmells <= 100) return 70;
    if (codeSmells <= 200) return 55;
    if (codeSmells <= 500) return 40;
    return 25;
  }

  // UPDATED: Weighted scoring
  private calculateTotalScore(scores: {
    bugsScore: number;
    documentationScore: number;
    vulnerabilitiesScore: number;
    codeSmellsScore: number;
    duplicationsScore: number;
  }): number {
    const { bugs, documentation, vulnerabilities, codeSmells, duplications } =
      this.weights;

    const total =
      scores.bugsScore * bugs +
      scores.documentationScore * documentation +
      scores.vulnerabilitiesScore * vulnerabilities +
      scores.codeSmellsScore * codeSmells +
      scores.duplicationsScore * duplications;

    return total;
  }
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { config, discovery, auth } = options;
  const router = Router();

  const scoreboardService = new SonarCloudScoreboardService(config);

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  router.get('/entity-scores', async (_req, res) => {
    try {
      console.log('Fetching entity scores...');

      const { token } = await auth.getPluginRequestToken({
        onBehalfOf: await auth.getOwnServiceCredentials(),
        targetPluginId: 'catalog',
      });

      const catalogClient = new CatalogClient({
        discoveryApi: discovery,
        fetchApi: {
          fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
            return fetch(input, {
              ...init,
              headers: {
                ...(init?.headers ?? {}),
                Authorization: `Bearer ${token}`,
              },
            });
          },
        },
      });

      const { items: entities } = await catalogClient.getEntities({
        filter: {
          kind: 'Component',
          'metadata.annotations.sonarcloud.io/project-key': CATALOG_FILTER_EXISTS,
        },
      });

      const scores = await scoreboardService.computeScores(entities);
      console.log(`Returning ${scores.length} scores`);
      res.json(scores);
    } catch (error) {
      console.error('Error fetching scores:', error);
      res.status(500).json({
        error: 'Failed to fetch scores',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  return router;
}
