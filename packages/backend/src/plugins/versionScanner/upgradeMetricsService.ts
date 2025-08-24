// import { LoggerService } from '@backstage/backend-plugin-api';
// // import { Config } from '@backstage/config';

// // --- TYPE DEFINITIONS for the new service ---
// export interface FeedbackSubmission {
//   easeScore: number;
//   promptHelpfulness: number;
//   docsHelpfulness: number;
//   satisfaction: number;
//   suggestions: string;
// }

// export interface UpgradeMetrics {
//   upgradesInitiated: number;
//   upgradesCompleted: number;
//   upgradeSuccessRate: number;
//   avgTimeToUpgradeHrs: number;
//   filesUpdated: number;
//   unitTestsGenerated: number;
//   preUpgradeTestPassRate: number;
//   postUpgradeTestPassRate: number;
//   cvesFixed: number;
//   buildTimeImprovementPercent: number;
//   avgEaseScore: number;
//   avgDocsHelpfulness: number;
//   timeSavedHrs: number;
//   improvementSuggestions: string[];
//   reportedBugs: string[];
// }

// // --- The new, dedicated service class ---
// export class UpgradeMetricsService {
//   // private readonly logger: LoggerService;

//   constructor(private readonly logger: LoggerService) {
//     }
//   // constructor(options: { logger: LoggerService }) {
//   //   this.logger = options.logger;
//   // }

//   // Service method to get dummy dashboard data
//   public async getUpgradeMetrics(): Promise<UpgradeMetrics> {
//     this.logger.info('Serving dummy upgrade metrics data.');
//     // In a real scenario, this method would query a database or log aggregator.
//     return {
//       upgradesInitiated: 15,
//       upgradesCompleted: 12,
//       upgradeSuccessRate: 84.5,
//       avgTimeToUpgradeHrs: 2.24,
//       filesUpdated: 120,
//       unitTestsGenerated: 28,
//       preUpgradeTestPassRate: 98.1,
//       postUpgradeTestPassRate: 97.6,
//       cvesFixed: 14,
//       buildTimeImprovementPercent: -15, // Negative means 15% faster
//       avgEaseScore: 4.2,
//       avgDocsHelpfulness: 3.8,
//       timeSavedHrs: 24, // Total hours saved across all upgrades
//       improvementSuggestions: [
//         'The final summary screen is confusing.',
//         'Need better handling for merge conflicts.',
//         'Could we integrate this with our Jira workflow?',
//       ],
//       reportedBugs: [
//         'Crashed when upgrading a multi-module Maven project.',
//         'Incorrectly identified Camel version in one repo.',
//       ],
//     };
//   }

//   // Service method to handle feedback submissions
//   // public async submitFeedback(feedback: FeedbackSubmission): Promise<{ status: string }> {
//   //   // In a real scenario, this would write to a database.
//   //   // For now, we just log it to the console to prove it works.
//   //   this.logger.info('Received new feedback submission!', { feedback });
//   //   return { status: 'ok' };
//   // }
// }

// import { LoggerService } from '@backstage/backend-plugin-api';
// import { Config } from '@backstage/config';
// import { GoogleGenerativeAI } from '@google/generative-ai';
// // import { Knex } from 'knex';

// // All Type Definitions are correct.
// export interface FeedbackSubmission {
//   easeScore: number;
//   promptHelpfulness: number;
//   docsHelpfulness: number;
//   satisfaction: number;
//   suggestions: string;
// }
// export interface UpgradeMetrics {
//   upgradesInitiated: number;
//   upgradesCompleted: number;
//   upgradeSuccessRate: number;
//   avgTimeToUpgradeMins: number;
//   filesUpdated: number;
//   unitTestsGenerated: number;
//   preUpgradeTestPassRate: number;
//   postUpgradeTestPassRate: number;
//   cvesFixed: number;
//   buildTimeImprovementPercent: number;
//   avgEaseScore: number;
//   avgDocsHelpfulness: number;
//   timeSavedHrs: number;
//   improvementSuggestions: string[];
//   reportedBugs: string[];
// }
// interface ParsedUpgradeRun {
//   repository: string;
//   completed: boolean;
//   preUpgradeTestSummary: { total: number; passed: number; };
//   postUpgradeTestSummary: { total: number; passed: number; };
//   upgradedDependencyCount: number;
//   addedDependencyCount: number;
//   fixedCveCount: number;
//   newCveCount: number;
//   filesChanged: number;
// }

// export interface FeedbackSubmission {
//   easeScore: number;
//   promptHelpfulness: number;
//   docsHelpfulness: number;
//   successRate: number;
//   satisfaction: number;
//   suggestions: string;
// }

// export class UpgradeMetricsService {
//   // private readonly logger: LoggerService;
//   // private readonly config: Config;
//   private readonly githubToken: string;
//   private readonly githubUsername: string;
//   private readonly genAI: GoogleGenerativeAI;

//   constructor(private readonly logger: LoggerService, private readonly config: Config) {
//     this.githubToken = this.config.getString('github.token');
//     this.githubUsername = this.config.getString('github.username');
//     this.genAI = new GoogleGenerativeAI(this.config.getString('gemini.apiKey'));
//   }

//   // Helper methods are unchanged and correct.
//   private async getFileContent(owner: string, repo: string, path: string): Promise<string | null> {
//     const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
//     try {
//       const response = await fetch(url, { headers: { Authorization: `token ${this.githubToken}` } });
//       if (response.status === 404) return null;
//       if (!response.ok) { this.logger.error(`Error fetching file ${path} from ${repo}: ${response.statusText}`); return null; }
//       const data = await response.json();
//       return Buffer.from(data.content, 'base64').toString('utf-8');
//     } catch (error: any) { this.logger.error(`Exception while fetching file ${path} from ${repo}`, error); return null; }
//   }
//   private async listUpgradeDirectories(owner: string, repo: string): Promise<{name: string, path: string}[]> {
//     const url = `https://api.github.com/repos/${owner}/${repo}/contents/.github/java-upgrade`;
//     try {
//       const response = await fetch(url, { headers: { Authorization: `token ${this.githubToken}` } });
//       if (response.status === 404) return [];
//       const data = await response.json();
//       return data.filter((item: any) => item.type === 'dir').map((item: any) => ({ name: item.name, path: item.path }));
//     } catch (error: any) { this.logger.warn(`Could not list upgrade directories for ${owner}/${repo}`, error); return []; }
//   }
  
//   private _buildLlmPrompt(markdownContent: string): string {
//     const jsonSchema = `
//       {
//         "completed": boolean,
//         "preUpgradeTestSummary": { "total": number, "passed": number },
//         "postUpgradeTestSummary": { "total": number, "passed": number },
//         "upgradedDependencyCount": number,
//         "addedDependencyCount": number,
//         "fixedCveCount": number,
//         "newCveCount": number,
//         "filesChanged": number
//       }
//     `;
//     return `
//       You are an expert log file analyzer for a software engineering team.
//       Your task is to extract specific metrics from a markdown file that summarizes a Java project upgrade.
//       You MUST respond with only a valid JSON object that strictly adheres to the following schema.
//       Do not include any introductory text, markdown formatting, or explanations in your response.

//       JSON Schema:
//       ${jsonSchema}

//       Guidelines for extraction:
//       - "completed": Set to true if an "After" row exists in the "Test Changes" table. Otherwise, false.
//       - "preUpgradeTestSummary": Extract the "Total" and "Passed" counts from the "Before" row of the "Test Changes" table. If the table is missing, return { "total": 0, "passed": 0 }.
//       - "postUpgradeTestSummary": Extract the "Total" and "Passed" counts from the "After" row of the "Test Changes" table. If the table is missing, return { "total": 0, "passed": 0 }.
//       - "upgradedDependencyCount": Count the number of rows in the "Upgraded Dependencies" table. If the table is missing, return 0.
//       - "addedDependencyCount": Count the number of rows in the "Added Dependencies" table. If the table is missing, return 0.
//       - "fixedCveCount": Count the number of commits that contain the phrase "Fix CVE".
//       - "newCveCount": Count the number of listed CVEs under the "Potential Issues" section.
//       - "filesChanged": Extract the number from the phrase "X files changed". If missing, return 0.

//       Now, analyze the following markdown content and provide the JSON response:

//       --- MARKDOWN START ---
//       ${markdownContent}
//       --- MARKDOWN END ---
//     `;
//   }
  
//   private async parseSummaryWithLlm(content: string, repoName: string): Promise<ParsedUpgradeRun | null> {
//     if (!content) return null;
//     this.logger.info(`Parsing summary for ${repoName} using Gemini...`);
//     try {
//       const model = this.genAI.getGenerativeModel({
//         model: 'gemini-2.5-flash',
//         generationConfig: { responseMimeType: 'application/json' },
//       });
//       const prompt = this._buildLlmPrompt(content);
//       const result = await model.generateContent(prompt);
//       const responseText = result.response.text();
//       const parsedJson = JSON.parse(responseText);
//       return { repository: repoName, ...parsedJson };
//     } catch (error: any) {
//       this.logger.error(`Failed to parse summary for ${repoName} with Gemini`, { error: error.stack });
//       return null;
//     }
//   }

//   public async getUpgradeMetrics(): Promise<UpgradeMetrics> {
//     this.logger.info(`Starting collection of upgrade metrics for user: ${this.githubUsername}`);
//     const reposUrl = `https://api.github.com/users/${this.githubUsername}/repos?per_page=100`;
//     const response = await fetch(reposUrl, { headers: { Authorization: `token ${this.githubToken}` } });
//     if (!response.ok) { throw new Error(`Failed to fetch repositories for user ${this.githubUsername}`); }
//     const repos: { name: string; owner: { login: string }; }[] = await response.json();

//     const allUpgradeRuns: ParsedUpgradeRun[] = [];

//     for (const repo of repos) {
//       const { owner, name } = repo;
//       const upgradeDirs = await this.listUpgradeDirectories(owner.login, name);
//       this.logger.info(`Found ${upgradeDirs.length} upgrade directories in ${owner.login}/${name}`);
//       if (upgradeDirs.length === 0) continue;

//       for (const dir of upgradeDirs) {
//         const summaryContent = await this.getFileContent(owner.login, name, `${dir.path}/summary.md`);
//         if (summaryContent) {
//           const parsedRun = await this.parseSummaryWithLlm(summaryContent, name);
//           if (parsedRun) {
//             allUpgradeRuns.push(parsedRun);
//           }
//         }
//       }
//     }
    
//     const totalInitiated = allUpgradeRuns.length;
//     const totalCompleted = allUpgradeRuns.filter(r => r.completed).length;
//     const totalPreUpgradeTests = allUpgradeRuns.reduce((sum, r) => sum + r.preUpgradeTestSummary.total, 0);
//     const totalPostUpgradeTests = allUpgradeRuns.reduce((sum, r) => sum + r.postUpgradeTestSummary.total, 0);
//     const totalPreUpgradePassed = allUpgradeRuns.reduce((sum, r) => sum + r.preUpgradeTestSummary.passed, 0);
//     const totalPostUpgradePassed = allUpgradeRuns.reduce((sum, r) => sum + r.postUpgradeTestSummary.passed, 0);
    
//     const aggregatedMetrics: UpgradeMetrics = {
//       upgradesInitiated: totalInitiated,
//       upgradesCompleted: totalCompleted,
//       upgradeSuccessRate: totalInitiated > 0 ? (totalCompleted / totalInitiated) * 100 : 0,
//       avgTimeToUpgradeMins: 2.5,
//       filesUpdated: allUpgradeRuns.reduce((sum, r) => sum + r.filesChanged, 0),
//       unitTestsGenerated: totalPostUpgradeTests - totalPreUpgradeTests,
//       preUpgradeTestPassRate: totalPreUpgradeTests > 0 ? (totalPreUpgradePassed / totalPreUpgradeTests) * 100 : 100,
//       postUpgradeTestPassRate: totalPostUpgradeTests > 0 ? (totalPostUpgradePassed / totalPostUpgradeTests) * 100 : 100,
//       cvesFixed: allUpgradeRuns.reduce((sum, r) => sum + r.fixedCveCount, 0),
//       buildTimeImprovementPercent: -15,
//       avgEaseScore: 4.2,
//       avgDocsHelpfulness: 3.8,
//       timeSavedHrs: 282,
//       improvementSuggestions: [ 'The final summary screen is confusing.', 'Need better handling for merge conflicts.' ],
//       reportedBugs: [ 'Crashed when upgrading a multi-module Maven project.' ],
//     };

//     return aggregatedMetrics;
//   }

//   //  public async submitFeedback(feedback: FeedbackSubmission): Promise<{ status: string }> {
//   //   this.logger.info('Received new feedback submission, writing to local database...');
//   //   try {
//   //     await this.database('feedback').insert({
//   //       easeScore: feedback.easeScore,
//   //       promptHelpfulness: feedback.promptHelpfulness,
//   //       docsHelpfulness: feedback.docsHelpfulness,
//   //       successRate: feedback.successRate,
//   //       satisfaction: feedback.satisfaction,
//   //       suggestions: feedback.suggestions,
//   //     });
//   //     this.logger.info('Successfully saved feedback to the local database.');
//   //     return { status: 'ok' };
//   //   } catch (error: any) {
//   //     this.logger.error('Failed to write feedback to local database', { error: error.stack });
//   //     throw new Error('Failed to save feedback.');
//   //   }
//   // }
// }

import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

// All Type Definitions are correct.
export interface FeedbackSubmission {
  easeScore: number;
  promptHelpfulness: number;
  docsHelpfulness: number;
  successRate: number;
  satisfaction: number;
  suggestions: string;
}
export interface UpgradeMetrics {
  upgradesInitiated: number;
  upgradesCompleted: number;
  upgradeSuccessRate: number;
  avgTimeToUpgradeMins: number;
  filesUpdated: number;
  unitTestsGenerated: number;
  preUpgradeTestPassRate: number;
  postUpgradeTestPassRate: number;
  cvesFixed: number;
  buildTimeImprovementPercent: number;
  avgEaseScore: number;
  avgDocsHelpfulness: number;
  timeSavedHrs: number;
  improvementSuggestions: string[];
  reportedBugs: string[];
}
interface ParsedUpgradeRun {
  repository: string;
  completed: boolean;
  preUpgradeTestSummary: { total: number; passed: number; };
  postUpgradeTestSummary: { total: number; passed: number; };
  upgradedDependencyCount: number;
  addedDependencyCount: number;
  fixedCveCount: number;
  newCveCount: number;
  filesChanged: number;
}

export class UpgradeMetricsService {
  private readonly githubToken: string;
  private readonly githubUsername: string;
  private readonly genAI: GoogleGenerativeAI;
  private readonly llmCache = new Map<string, ParsedUpgradeRun>();

  constructor(private readonly logger: LoggerService, private readonly config: Config) {
    this.githubToken = this.config.getString('github.token');
    this.githubUsername = this.config.getString('github.username');
    this.genAI = new GoogleGenerativeAI(this.config.getString('gemini.apiKey'));
  }

  // Helper methods are unchanged and correct.
  private async getFileContent(owner: string, repo: string, path: string): Promise<string | null> {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    try {
      const response = await fetch(url, { headers: { Authorization: `token ${this.githubToken}` } });
      if (response.status === 404) return null;
      if (!response.ok) { this.logger.error(`Error fetching file ${path} from ${repo}: ${response.statusText}`); return null; }
      const data = await response.json();
      return Buffer.from(data.content, 'base64').toString('utf-8');
    } catch (error: any) { this.logger.error(`Exception while fetching file ${path} from ${repo}`, error); return null; }
  }
  private async listUpgradeDirectories(owner: string, repo: string): Promise<{name: string, path: string}[]> {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/.github/java-upgrade`;
    try {
      const response = await fetch(url, { headers: { Authorization: `token ${this.githubToken}` } });
      if (response.status === 404) return [];
      const data = await response.json();
      return data.filter((item: any) => item.type === 'dir').map((item: any) => ({ name: item.name, path: item.path }));
    } catch (error: any) { this.logger.warn(`Could not list upgrade directories for ${owner}/${repo}`, error); return []; }
  }
  
  private _buildLlmPrompt(markdownContent: string): string {
    const jsonSchema = `{ "completed": boolean, "preUpgradeTestSummary": { "total": number, "passed": number }, "postUpgradeTestSummary": { "total": number, "passed": number }, "upgradedDependencyCount": number, "addedDependencyCount": number, "fixedCveCount": number, "newCveCount": number, "filesChanged": number }`;
    return `
      You are an expert log file analyzer for a software engineering team.
      Your task is to extract specific metrics from a markdown file that summarizes a Java project upgrade.
      You MUST respond with only a valid JSON object that strictly adheres to the following schema.
      Do not include any introductory text, markdown formatting, or explanations in your response.

      JSON Schema:
      ${jsonSchema}

      Guidelines for extraction:
      - "completed": Set to true if an "After" row exists in the "Test Changes" table. Otherwise, false.
      - "preUpgradeTestSummary": Extract the "Total" and "Passed" counts from the "Before" row of the "Test Changes" table. If the table is missing, return { "total": 0, "passed": 0 }.
      - "postUpgradeTestSummary": Extract the "Total" and "Passed" counts from the "After" row of the "Test Changes" table. If the table is missing, return { "total": 0, "passed": 0 }.
      - "upgradedDependencyCount": Count the number of rows in the "Upgraded Dependencies" table. If the table is missing, return 0.
      - "addedDependencyCount": Count the number of rows in the "Added Dependencies" table. If the table is missing, return 0.
      - "fixedCveCount": Count the number of commits that contain the phrase "Fix CVE".
      - "newCveCount": Count the number of listed CVEs under the "Potential Issues" section.
      - "filesChanged": Extract the number from the phrase "X files changed". If missing, return 0.

      Now, analyze the following markdown content and provide the JSON response:

      --- MARKDOWN START ---
      ${markdownContent}
      --- MARKDOWN END ---
    `;
  }
  
  private async parseSummaryWithLlm(content: string, repoName: string, runDir: string): Promise<ParsedUpgradeRun | null> {
    if (!content) return null;
    const cacheKey = `${repoName}/.github/java-upgrade/${runDir}/summary.md`;
    if (this.llmCache.has(cacheKey)) {
      this.logger.info(`Cache HIT for ${cacheKey}.`);
      return this.llmCache.get(cacheKey)!;
    }
    this.logger.info(`Cache MISS for ${cacheKey}. Calling Gemini API...`);
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' },
      });
      const prompt = this._buildLlmPrompt(content);
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const parsedJson = JSON.parse(responseText);
      const fullResult = { repository: repoName, ...parsedJson };
      this.llmCache.set(cacheKey, fullResult);
      return fullResult;
    } catch (error: any) {
      this.logger.error(`Failed to parse summary for ${cacheKey} with Gemini`, { error: error.stack });
      return null;
    }
  }

  public async getUpgradeMetrics(): Promise<UpgradeMetrics> {
    this.logger.info(`Starting collection of upgrade metrics for user: ${this.githubUsername}`);
    const reposUrl = `https://api.github.com/users/${this.githubUsername}/repos?per_page=100`;
    const response = await fetch(reposUrl, { headers: { Authorization: `token ${this.githubToken}` } });
    if (!response.ok) { throw new Error(`Failed to fetch repositories for user ${this.githubUsername}`); }
    const repos: { name: string; owner: { login: string }; }[] = await response.json();

    const allUpgradeRuns: ParsedUpgradeRun[] = [];

    for (const repo of repos) {
      const { owner, name } = repo;
      const upgradeDirs = await this.listUpgradeDirectories(owner.login, name);
      if (upgradeDirs.length === 0) continue;

      for (const dir of upgradeDirs) {
        const summaryContent = await this.getFileContent(owner.login, name, `${dir.path}/summary.md`);
        if (summaryContent) {
          const parsedRun = await this.parseSummaryWithLlm(summaryContent, name, dir.name);
          if (parsedRun) {
            allUpgradeRuns.push(parsedRun);
          }
        }
      }
    }
    
    // ---> THE FIX IS HERE <---
    // The full aggregation logic and the complete aggregatedMetrics object are restored.
    const totalInitiated = allUpgradeRuns.length;
    const totalCompleted = allUpgradeRuns.filter(r => r.completed).length;
    const totalPreUpgradeTests = allUpgradeRuns.reduce((sum, r) => sum + r.preUpgradeTestSummary.total, 0);
    const totalPostUpgradeTests = allUpgradeRuns.reduce((sum, r) => sum + r.postUpgradeTestSummary.total, 0);
    const totalPreUpgradePassed = allUpgradeRuns.reduce((sum, r) => sum + r.preUpgradeTestSummary.passed, 0);
    const totalPostUpgradePassed = allUpgradeRuns.reduce((sum, r) => sum + r.postUpgradeTestSummary.passed, 0);
    
    const aggregatedMetrics: UpgradeMetrics = {
      upgradesInitiated: totalInitiated,
      upgradesCompleted: totalCompleted,
      upgradeSuccessRate: totalInitiated > 0 ? (totalCompleted / totalInitiated) * 100 : 0,
      avgTimeToUpgradeMins: 2.5, // Dummy data
      filesUpdated: allUpgradeRuns.reduce((sum, r) => sum + r.filesChanged, 0),
      unitTestsGenerated: totalPostUpgradeTests - totalPreUpgradeTests,
      preUpgradeTestPassRate: totalPreUpgradeTests > 0 ? (totalPreUpgradePassed / totalPreUpgradeTests) * 100 : 100,
      postUpgradeTestPassRate: totalPostUpgradeTests > 0 ? (totalPostUpgradePassed / totalPostUpgradeTests) * 100 : 100,
      cvesFixed: allUpgradeRuns.reduce((sum, r) => sum + r.fixedCveCount, 0),
      buildTimeImprovementPercent: -15, // Dummy data
      avgEaseScore: 4.2, // Dummy data
      avgDocsHelpfulness: 3.8, // Dummy data
      timeSavedHrs: 2, // Dummy data
      improvementSuggestions: [ 'The final summary screen is confusing.', 'Need better handling for merge conflicts.' ], // Dummy data
      reportedBugs: [ 'Crashed when upgrading a multi-module Maven project.' ], // Dummy data
    };

    return aggregatedMetrics;
  }

  // public async submitFeedback(feedback: FeedbackSubmission): Promise<{ status: string }> {
  //   this.logger.info('Received new feedback submission!', { feedback });
  //   return { status: 'ok' };
  // }
}