// import { LoggerService } from '@backstage/backend-plugin-api';
// import { Config } from '@backstage/config';
// import { XMLParser } from 'fast-xml-parser';

// // All Type Definitions are correct.
// export interface VersionInfo {
//   repository: string;
//   repositoryUrl: string;
//   javaVersion: string | null;
//   springBootVersion: string | null;
//   gradleVersion: string | null;
//   mavenVersion: string | null;
//   camelVersion: string | null;
// }
// export interface ProjectAnalysisDetail {
//   repository: string;
//   repositoryUrl: string;
//   projectType: 'gradle' | 'maven' | 'unknown';
//   bestPracticesScore: number;
//   details: Record<string, string | number | null>;
// }

// export class VersionScannerService {
//   private readonly githubToken: string;
//   private readonly githubUsername: string;

//   constructor(private readonly logger: LoggerService, private readonly config: Config) {
//     this.githubToken = this.config.getString('github.token');
//     this.githubUsername = this.config.getString('github.username');
//   }

//   // All parsing methods are correct and do not need changes.
//     private async getFileContent(owner: string, repo: string, path: string): Promise<string | null> {
//     const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
//     try {
//       const response = await fetch(url, { headers: { Authorization: `token ${this.githubToken}` } });
//       if (response.status === 404) { return null; }
//       if (!response.ok) { this.logger.error(`Error fetching file ${path} from ${repo}: ${response.statusText}`); return null; }
//       const data = await response.json();
//       return Buffer.from(data.content, 'base64').toString('utf-8');
//     } catch (error: any) { this.logger.error(`Exception while fetching file ${path} from ${repo}`, error); return null; }
//   }
//   private parseJavaVersion(pomXml: string | null, buildGradle: string | null): string | null {
//     if (buildGradle) {
//       let match = buildGradle.match(/JavaLanguageVersion\.of\((\d+)\)/);
//       if (match && match[1]) return match[1];
//       match = buildGradle.match(/sourceCompatibility\s*=\s*JavaVersion\.VERSION_(\d+)/);
//       if (match && match[1]) return match[1];
//       match = buildGradle.match(/sourceCompatibility\s*=\s*['"]?(\d+(\.\d+)?)['"]?/);
//       if (match && match[1]) return match[1];
//     }
//     if (pomXml) {
//       try { const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true }); const jsonObj = parser.parse(pomXml); const javaVersion = jsonObj.project?.properties?.['java.version']; if (javaVersion) return javaVersion; } catch (error: any) { this.logger.warn('Failed to parse pom.xml for Java version', error); }
//     }
//     return null;
//   }
//   private parseSpringBootVersion(pomXml: string | null, buildGradle: string | null): string | null {
//     if (buildGradle) { const pluginMatch = buildGradle.match(/id\s*['"]org\.springframework\.boot['"]\s*version\s*['"]([^'"]+)['"]/); if (pluginMatch && pluginMatch[1]) return pluginMatch[1]; const dependencyMatch = buildGradle.match(/spring-boot.*?:([\d\.A-Za-z-]+)/); if (dependencyMatch && dependencyMatch[1]) return dependencyMatch[1]; }
//     if (pomXml) {
//       try { const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true }); const jsonObj = parser.parse(pomXml); if (jsonObj.project?.parent?.artifactId === 'spring-boot-starter-parent') { return jsonObj.project.parent.version; } const springVersion = jsonObj.project?.properties?.['spring-boot.version']; if (springVersion) return springVersion; } catch (error: any) { this.logger.warn('Failed to parse pom.xml for Spring Boot version', error); }
//     }
//     return null;
//   }
//   private parseGradleVersion(wrapperProps: string | null): string | null {
//     if (wrapperProps) { const match = wrapperProps.match(/distributionUrl=.*gradle-([0-9\.]+)-bin\.zip/); if (match && match[1]) return match[1]; }
//     return null;
//   }
//     private parseMavenVersion(wrapperProps: string | null): string | null {
//     if (wrapperProps) {
//       const match = wrapperProps.match(/apache-maven-([0-9\.]+)-bin\.zip/);
//       if (match && match[1]) {
//         return match[1];
//       }
//     }
//     return null;
//   }
//   private parseCamelVersion(pomXml: string | null, buildGradle: string | null): string | null {
//     if (buildGradle) { const match = buildGradle.match(/['"]org\.apache\.camel\..*?:([\d\w\.-]+)['"]/); if (match && match[1]) { return match[1]; } }
//     if (pomXml) {
//       try { const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true }); const jsonObj = parser.parse(pomXml); const dependencies = jsonObj.project?.dependencies?.dependency; if (dependencies && Array.isArray(dependencies)) { for (const dep of dependencies) { if (dep.groupId && dep.groupId.includes('apache.camel') && dep.version) { return dep.version; } } } } catch (error: any) { this.logger.warn('Failed to parse pom.xml for Camel version', error); }
//     }
//     return null;
//   }
//   public async scanAllRepos(): Promise<VersionInfo[]> {
//     this.logger.info(`Starting version scan for user: ${this.githubUsername}`);
//     const reposUrl = `https://api.github.com/users/${this.githubUsername}/repos?per_page=100`;
//     const response = await fetch(reposUrl, { headers: { Authorization: `token ${this.githubToken}` } });
//     if (!response.ok) { throw new Error(`Failed to fetch repositories: ${response.statusText}`); }
//     const repos: { name: string; owner: { login: string }; html_url: string; }[] = await response.json();
//     const allVersions: VersionInfo[] = [];
//     for (const repo of repos) {
//       const owner = repo.owner.login; const name = repo.name;
//       const [pomXml, buildGradle, gradleWrapperProps, mavenWrapperProps] = await Promise.all([this.getFileContent(owner, name, 'pom.xml'), this.getFileContent(owner, name, 'build.gradle'), this.getFileContent(owner, name, 'gradle/wrapper/gradle-wrapper.properties'), this.getFileContent(owner, name, '.mvn/wrapper/maven-wrapper.properties')]);
//       const versionInfo: VersionInfo = { repository: name, repositoryUrl: repo.html_url, gradleVersion: this.parseGradleVersion(gradleWrapperProps), mavenVersion: this.parseMavenVersion(mavenWrapperProps), javaVersion: this.parseJavaVersion(pomXml, buildGradle), springBootVersion: this.parseSpringBootVersion(pomXml, buildGradle), camelVersion: this.parseCamelVersion(pomXml, buildGradle) };
//       allVersions.push(versionInfo);
//     }
//     return allVersions;
//   }
//   private analyzeGradleProject(content: string): Omit<ProjectAnalysisDetail, 'repository' | 'repositoryUrl' | 'bestPracticesScore'> {
//     const javaVersion = this.parseJavaVersion(null, content);
//     const springBootVersion = this.parseSpringBootVersion(null, content);
//     const pluginCount = (content.match(/^\s*id\s*['"].*?['"]/gm) || []).length;
//     const dependencyCount = (content.match(/^\s*(implementation|testImplementation|runtimeOnly|api)\s*.*$/gm) || []).length;
//     return {
//       projectType: 'gradle',
//       details: { 'Java Version': javaVersion, 'Spring Boot Version': springBootVersion, 'Plugin Count': pluginCount, 'Dependency Count': dependencyCount },
//     };
//   }
//   private analyzeMavenProject(content: string): Omit<ProjectAnalysisDetail, 'repository' | 'repositoryUrl' | 'bestPracticesScore'> {
//     const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true });
//     const jsonObj = parser.parse(content);
//     const javaVersion = jsonObj.project?.properties?.['java.version'] ?? null;
//     const springBootVersion = jsonObj.project?.parent?.artifactId === 'spring-boot-starter-parent' ? jsonObj.project.parent.version : null;
//     const dependencyCount = jsonObj.project?.dependencies?.dependency?.length ?? 0;
//     return {
//       projectType: 'maven',
//       details: { 'Java Version': javaVersion, 'Spring Boot Version': springBootVersion, 'Dependency Count': dependencyCount },
//     };
//   }
//   private calculateScore(analysis: Omit<ProjectAnalysisDetail, 'repository' | 'repositoryUrl' | 'bestPracticesScore'>): number {
//     let score = 0;
//     if (analysis.projectType === 'gradle' || analysis.projectType === 'maven') {
//       if (analysis.details['Java Version']) score += 10;
//       if (analysis.details['Spring Boot Version']) score += 10;
//       if ((analysis.details['Dependency Count'] as number) > 2) score += 5;
//     }
//     return score;
//   }
  
//   // ---> THE FIX IS HERE: This method is now much more powerful <---
//   public async getProjectAnalysisData() {
//     this.logger.info('Starting generic project analysis...');
//     const reposUrl = `https://api.github.com/users/${this.githubUsername}/repos?per_page=100`;
//     const response = await fetch(reposUrl, { headers: { Authorization: `token ${this.githubToken}` } });
//     if (!response.ok) { throw new Error(`Failed to fetch repositories: ${response.statusText}`); }
//     const repos: { name: string; owner: { login: string }; html_url: string; }[] = await response.json();
    
//     const projectDetails: ProjectAnalysisDetail[] = [];

//     for (const repo of repos) {
//       const [gradleContent, mavenContent] = await Promise.all([
//         this.getFileContent(repo.owner.login, repo.name, 'build.gradle'),
//         this.getFileContent(repo.owner.login, repo.name, 'pom.xml'),
//       ]);

//       if (gradleContent) {
//         const analysis = this.analyzeGradleProject(gradleContent);
//         projectDetails.push({
//           repository: repo.name,
//           repositoryUrl: repo.html_url,
//           ...analysis,
//           bestPracticesScore: this.calculateScore(analysis),
//         });
//       } else if (mavenContent) {
//         const analysis = this.analyzeMavenProject(mavenContent);
//         projectDetails.push({
//           repository: repo.name,
//           repositoryUrl: repo.html_url,
//           ...analysis,
//           bestPracticesScore: this.calculateScore(analysis),
//         });
//       }
//     }

//     // If there are no projects, return an empty state
//     if (projectDetails.length === 0) {
//       return {
//         details: [],
//         summary: {
//           javaVersionCounts: {},
//           springBootVersionCounts: {},
//           bestProject: null,
//           worstProject: null,
//         },
//       };
//     }

//     // Calculate summaries after all details are collected
//     const javaVersionCounts = projectDetails.reduce((acc, cur) => {
//       const version = cur.details['Java Version'];
//       if (version) acc[version] = (acc[version] || 0) + 1;
//       return acc;
//     }, {} as Record<string, number>);

//     const springBootVersionCounts = projectDetails.reduce((acc, cur) => {
//       const version = cur.details['Spring Boot Version'];
//       if (version) acc[version] = (acc[version] || 0) + 1;
//       return acc;
//     }, {} as Record<string, number>);

//     const sortedByScore = [...projectDetails].sort((a, b) => b.bestPracticesScore - a.bestPracticesScore);
//     const bestProject = sortedByScore[0];
//     const worstProject = sortedByScore[sortedByScore.length - 1];

//     return {
//       details: projectDetails,
//       summary: {
//         javaVersionCounts,
//         springBootVersionCounts,
//         bestProject,
//         worstProject,
//       },
//     };
//   }
// }

// import { LoggerService } from '@backstage/backend-plugin-api';
// import { Config } from '@backstage/config';
// // We no longer import CatalogApi
// import { GoogleGenerativeAI } from '@google/generative-ai';
// // import { XMLParser } from 'fast-xml-parser';

// // All Type Definitions are correct.
// export interface VersionInfo {
//   repository: string;
//   repositoryUrl: string;
//   javaVersion: string | null;
//   springBootVersion: string | null;
//   gradleVersion: string | null;
//   mavenVersion: string | null;
//   camelVersion: string | null;
// }
// export interface ProjectAnalysisDetail {
//   repository: string;
//   repositoryUrl: string;
//   projectType: 'gradle' | 'maven' | 'unknown';
//   bestPracticesScore: number;
//   details: Record<string, string | number | null>;
// }
// interface ParsedBuildFile {
//   javaVersion: string | null;
//   springBootVersion: string | null;
//   camelVersion: string | null;
//   dependencyCount: number;
//   pluginCount: number;
// }

// export class VersionScannerService {
//   private readonly githubToken: string;
//   // ---> CHANGE 1: Re-add githubUsername and remove catalogApi <---
//   private readonly githubUsername: string;
//   private readonly genAI: GoogleGenerativeAI;

//   constructor(
//     private readonly logger: LoggerService,
//     private readonly config: Config,
//     // The catalogApi parameter is removed
//   ) {
//     this.githubToken = this.config.getString('github.token');
//     this.genAI = new GoogleGenerativeAI(this.config.getString('gemini.apiKey'));
//     // ---> CHANGE 2: Read username from config again <---
//     this.githubUsername = this.config.getString('github.username');
//   }
  
//   // All private helper and parsing methods are unchanged and correct.
//   private parseGradleVersion(wrapperProps: string | null): string | null {
//     if (wrapperProps) { const match = wrapperProps.match(/distributionUrl=.*gradle-([0-9\.]+)-bin\.zip/); if (match && match[1]) return match[1]; }
//     return null;
//   }
//   private parseMavenVersion(wrapperProps: string | null): string | null {
//     if (wrapperProps) { const match = wrapperProps.match(/apache-maven-([0-9\.]+)-bin\.zip/); if (match && match[1]) return match[1]; }
//     return null;
//   }
//   private async _parseBuildFileWithLlm(content: string, fileType: 'pom.xml' | 'build.gradle'): Promise<ParsedBuildFile | null> {
//     if (!content) return null;
//     const jsonSchema = `{ "javaVersion": "string or null", "springBootVersion": "string or null", "camelVersion": "string or null", "dependencyCount": "number", "pluginCount": "number" }`;
//     const prompt = `
//       You are an expert build file analyzer... 
//       ... (rest of the prompt is the same) ...
//       --- FILE CONTENT START ---
//       ${content}
//       --- FILE CONTENT END ---
//     `;
//     try {
//       const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { responseMimeType: 'application/json' } });
//       const result = await model.generateContent(prompt);
//       return JSON.parse(result.response.text()) as ParsedBuildFile;
//     } catch (error: any) {
//       this.logger.error(`Failed to parse ${fileType} with Gemini`, { error: error.stack });
//       return null;
//     }
//   }
//   private async getFileContent(owner: string, repo: string, path: string): Promise<string | null> {
//     const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
//     try {
//       const response = await fetch(url, { headers: { Authorization: `token ${this.githubToken}` } });
//       if (response.status === 404) { return null; }
//       if (!response.ok) { this.logger.error(`Error fetching file ${path} from ${repo}: ${response.statusText}`); return null; }
//       const data = await response.json();
//       return Buffer.from(data.content, 'base64').toString('utf-8');
//     } catch (error: any) { this.logger.error(`Exception while fetching file ${path} from ${repo}`, error); return null; }
//   }

//   // ---> UPDATED: This method now fetches from GitHub User API <---
//   public async getVersionInfo(): Promise<VersionInfo[]> {
//     this.logger.info(`Starting LIVE version scan for user: ${this.githubUsername}`);
//     const reposUrl = `https://api.github.com/users/${this.githubUsername}/repos?per_page=100`;
//     const response = await fetch(reposUrl, { headers: { Authorization: `token ${this.githubToken}` } });
//     if (!response.ok) { throw new Error(`Failed to fetch repositories`); }
//     const repos: { name: string; owner: { login: string }; html_url: string; }[] = await response.json();

//     const allVersions: VersionInfo[] = [];
//     for (const repo of repos) {
//       const { owner, name, html_url } = repo;
//       const [pomXmlContent, gradleContent, gradleWrapperProps, mavenWrapperProps] = await Promise.all([
//           this.getFileContent(owner.login, name, 'pom.xml'), 
//           this.getFileContent(owner.login, name, 'build.gradle'), 
//           this.getFileContent(owner.login, name, 'gradle/wrapper/gradle-wrapper.properties'),
//           this.getFileContent(owner.login, name, '.mvn/wrapper/maven-wrapper.properties')
//       ]);
//       let parsedInfo: ParsedBuildFile | null = null;
//       if (gradleContent) {
//         parsedInfo = await this._parseBuildFileWithLlm(gradleContent, 'build.gradle');
//       } else if (pomXmlContent) {
//         parsedInfo = await this._parseBuildFileWithLlm(pomXmlContent, 'pom.xml');
//       }
//       const versionInfo = { 
//           repository: name, 
//           repositoryUrl: html_url, 
//           gradleVersion: this.parseGradleVersion(gradleWrapperProps),
//           mavenVersion: this.parseMavenVersion(mavenWrapperProps),
//           javaVersion: parsedInfo?.javaVersion ?? null,
//           springBootVersion: parsedInfo?.springBootVersion ?? null,
//           camelVersion: parsedInfo?.camelVersion ?? null
//       };
//       allVersions.push(versionInfo);
//     }
//     return allVersions;
//   }
  
//   // ---> UPDATED: This method also now fetches from GitHub User API <---
//   public async getProjectAnalysisData() {
//     this.logger.info(`Starting LIVE project analysis for user: ${this.githubUsername}`);
//     const reposUrl = `https://api.github.com/users/${this.githubUsername}/repos?per_page=100`;
//     const response = await fetch(reposUrl, { headers: { Authorization: `token ${this.githubToken}` } });
//     if (!response.ok) { throw new Error(`Failed to fetch repositories`); }
//     const repos: { name: string; owner: { login: string }; html_url: string; }[] = await response.json();

//     const projectDetails: ProjectAnalysisDetail[] = [];
//     for (const repo of repos) {
//       const { owner, name, html_url } = repo;
//       const [gradleContent, mavenContent] = await Promise.all([
//         this.getFileContent(owner.login, name, 'build.gradle'),
//         this.getFileContent(owner.login, name, 'pom.xml'),
//       ]);
//       let analysisPart: Omit<ProjectAnalysisDetail, 'repository' | 'repositoryUrl' | 'bestPracticesScore'> | null = null;
//       if (gradleContent) {
//         const parsedInfo = await this._parseBuildFileWithLlm(gradleContent, 'build.gradle');
//         if (parsedInfo) {
//           analysisPart = { projectType: 'gradle', details: { 'Java Version': parsedInfo.javaVersion, 'Spring Boot Version': parsedInfo.springBootVersion, 'Plugin Count': parsedInfo.pluginCount, 'Dependency Count': parsedInfo.dependencyCount } };
//         }
//       } else if (mavenContent) {
//         const parsedInfo = await this._parseBuildFileWithLlm(mavenContent, 'pom.xml');
//         if (parsedInfo) {
//           analysisPart = { projectType: 'maven', details: { 'Java Version': parsedInfo.javaVersion, 'Spring Boot Version': parsedInfo.springBootVersion, 'Dependency Count': parsedInfo.dependencyCount } };
//         }
//       }
//       if (analysisPart) {
//         projectDetails.push({ repository: name, repositoryUrl: html_url, ...analysisPart, bestPracticesScore: this.calculateScore(analysisPart) });
//       }
//     }
//     // Summary logic is unchanged and correct.
//     if (projectDetails.length === 0) { return { details: [], summary: { javaVersionCounts: {}, springBootVersionCounts: {}, bestProject: null, worstProject: null } }; }
//     const javaVersionCounts = projectDetails.reduce((acc, cur) => { const v = cur.details['Java Version']; if (v) acc[v] = (acc[v] || 0) + 1; return acc; }, {} as Record<string, number>);
//     const springBootVersionCounts = projectDetails.reduce((acc, cur) => { const v = cur.details['Spring Boot Version']; if (v) acc[v] = (acc[v] || 0) + 1; return acc; }, {} as Record<string, number>);
//     const sortedByScore = [...projectDetails].sort((a, b) => b.bestPracticesScore - a.bestPracticesScore);
//     return {
//       details: projectDetails,
//       summary: { javaVersionCounts, springBootVersionCounts, bestProject: sortedByScore[0], worstProject: sortedByScore[sortedByScore.length - 1] },
//     };
//   }
  
//   private calculateScore(analysis: Omit<ProjectAnalysisDetail, 'repository' | 'repositoryUrl' | 'bestPracticesScore'>): number {
//     let score = 0;
//     if (analysis.details['Java Version']) score += 10;
//     if (analysis.details['Spring Boot Version']) score += 10;
//     if ((analysis.details['Dependency Count'] as number) > 2) score += 5;
//     return score;
//   }
// }

import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { XMLParser } from 'fast-xml-parser';

// All Type Definitions are correct.
export interface VersionInfo {
  repository: string;
  repositoryUrl: string;
  javaVersion: string | null;
  springBootVersion: string | null;
  gradleVersion: string | null;
  mavenVersion: string | null;
  camelVersion: string | null;
}
export interface ProjectAnalysisDetail {
  repository: string;
  repositoryUrl: string;
  projectType: 'gradle' | 'maven' | 'unknown';
  bestPracticesScore: number;
  details: Record<string, string | number | null>;
}
interface ParsedBuildFile {
  javaVersion: string | null;
  springBootVersion: string | null;
  camelVersion: string | null;
  dependencyCount: number;
  pluginCount: number;
}

export class VersionScannerService {
  private readonly githubToken: string;
  private readonly githubUsername: string;
  private readonly genAI: GoogleGenerativeAI;
  private readonly llmCache = new Map<string, ParsedBuildFile>();

  constructor(
    private readonly logger: LoggerService,
    private readonly config: Config,
  ) {
    this.githubToken = this.config.getString('github.token');
    this.genAI = new GoogleGenerativeAI(this.config.getString('gemini.apiKey'));
    this.githubUsername = this.config.getString('github.username');
  }
  
  private parseGradleVersion(wrapperProps: string | null): string | null {
    if (wrapperProps) { const match = wrapperProps.match(/distributionUrl=.*gradle-([0-9\.]+)-bin\.zip/); if (match && match[1]) return match[1]; }
    return null;
  }
  private parseMavenVersion(wrapperProps: string | null): string | null {
    if (wrapperProps) { const match = wrapperProps.match(/apache-maven-([0-9\.]+)-bin\.zip/); if (match && match[1]) return match[1]; }
    return null;
  }
  
  private async _parseBuildFileWithLlm(content: string, fileType: 'pom.xml' | 'build.gradle', repoName: string): Promise<ParsedBuildFile | null> {
    if (!content) return null;
    const cacheKey = `${repoName}/${fileType}`;
    if (this.llmCache.has(cacheKey)) {
      this.logger.info(`Cache HIT for ${cacheKey}.`);
      return this.llmCache.get(cacheKey)!;
    }
    this.logger.info(`Cache MISS for ${cacheKey}. Calling Gemini API...`);

    // ---> THE FIX IS HERE: The full, detailed prompt is restored. <---
    const jsonSchema = `{ "javaVersion": "string or null", "springBootVersion": "string or null", "camelVersion": "string or null", "dependencyCount": "number", "pluginCount": "number" }`;
    const prompt = `
      You are an expert build file analyzer for Java projects.
      Your task is to extract specific version and count information from the provided build file content.
      You MUST respond with only a valid JSON object that strictly adheres to the following schema.
      Do not include any introductory text, markdown formatting, or explanations in your response.

      JSON Schema:
      ${jsonSchema}

      Guidelines for extraction:
      - "javaVersion": Find the Java version. Look for 'java.version' property in pom.xml or 'sourceCompatibility' / 'JavaLanguageVersion.of(XX)' in build.gradle. Return the version string (e.g., "17", "1.8").
      - "springBootVersion": Find the Spring Boot version. Look for the version of the 'spring-boot-starter-parent' in pom.xml or the 'org.springframework.boot' plugin in build.gradle.
      - "camelVersion": Find the version for any dependency with a groupId containing 'org.apache.camel'.
      - "dependencyCount": Count the total number of <dependency> tags in a pom.xml or 'implementation', 'api', 'testImplementation' declarations in a build.gradle file.
      - "pluginCount": Count the total number of <plugin> tags in a pom.xml or 'plugins' block declarations in a build.gradle file.
      - If a value cannot be found for any field, return null for that specific field (or 0 for counts).

      Now, analyze the following ${fileType} content and provide the JSON response:

      --- FILE CONTENT START ---
      ${content}
      --- FILE CONTENT END ---
    `;

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { responseMimeType: 'application/json' } });
      const result = await model.generateContent(prompt);
      const parsedJson = JSON.parse(result.response.text()) as ParsedBuildFile;
      this.llmCache.set(cacheKey, parsedJson);
      return parsedJson;
    } catch (error: any) {
      this.logger.error(`Failed to parse ${fileType} with Gemini for ${repoName}`, { error: error.stack });
      return null;
    }
  }
  
  private async getFileContent(owner: string, repo: string, path: string): Promise<string | null> {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    try {
      const response = await fetch(url, { headers: { Authorization: `token ${this.githubToken}` } });
      if (response.status === 404) { return null; }
      if (!response.ok) { this.logger.error(`Error fetching file ${path} from ${repo}: ${response.statusText}`); return null; }
      const data = await response.json();
      return Buffer.from(data.content, 'base64').toString('utf-8');
    } catch (error: any) { this.logger.error(`Exception while fetching file ${path} from ${repo}`, error); return null; }
  }

  public async getVersionInfo(): Promise<VersionInfo[]> {
    const repos = await this._fetchUserRepos();
    const allVersions: VersionInfo[] = [];
    for (const repo of repos) {
      const { owner, name, html_url } = repo;
      const [pomXmlContent, gradleContent, gradleWrapperProps, mavenWrapperProps] = await Promise.all([
          this.getFileContent(owner.login, name, 'pom.xml'), 
          this.getFileContent(owner.login, name, 'build.gradle'), 
          this.getFileContent(owner.login, name, 'gradle/wrapper/gradle-wrapper.properties'),
          this.getFileContent(owner.login, name, '.mvn/wrapper/maven-wrapper.properties')
      ]);
      let parsedInfo: ParsedBuildFile | null = null;
      if (gradleContent) {
        parsedInfo = await this._parseBuildFileWithLlm(gradleContent, 'build.gradle', name);
      } else if (pomXmlContent) {
        parsedInfo = await this._parseBuildFileWithLlm(pomXmlContent, 'pom.xml', name);
      }
      const versionInfo = { 
          repository: name, repositoryUrl: html_url, 
          gradleVersion: this.parseGradleVersion(gradleWrapperProps),
          mavenVersion: this.parseMavenVersion(mavenWrapperProps),
          javaVersion: parsedInfo?.javaVersion ?? null,
          springBootVersion: parsedInfo?.springBootVersion ?? null,
          camelVersion: parsedInfo?.camelVersion ?? null
      };
      allVersions.push(versionInfo);
    }
    return allVersions;
  }
  
  public async getProjectAnalysisData() {
    const repos = await this._fetchUserRepos();
    const projectDetails: ProjectAnalysisDetail[] = [];
    for (const repo of repos) {
      const { owner, name, html_url } = repo;
      const [gradleContent, mavenContent] = await Promise.all([
        this.getFileContent(owner.login, name, 'build.gradle'),
        this.getFileContent(owner.login, name, 'pom.xml'),
      ]);
      let analysisPart: Omit<ProjectAnalysisDetail, 'repository' | 'repositoryUrl' | 'bestPracticesScore'> | null = null;
      if (gradleContent) {
        const parsedInfo = await this._parseBuildFileWithLlm(gradleContent, 'build.gradle', name);
        if (parsedInfo) {
          analysisPart = { projectType: 'gradle', details: { 'Java Version': parsedInfo.javaVersion, 'Spring Boot Version': parsedInfo.springBootVersion, 'Plugin Count': parsedInfo.pluginCount, 'Dependency Count': parsedInfo.dependencyCount } };
        }
      } else if (mavenContent) {
        const parsedInfo = await this._parseBuildFileWithLlm(mavenContent, 'pom.xml', name);
        if (parsedInfo) {
          analysisPart = { projectType: 'maven', details: { 'Java Version': parsedInfo.javaVersion, 'Spring Boot Version': parsedInfo.springBootVersion, 'Dependency Count': parsedInfo.dependencyCount } };
        }
      }
      if (analysisPart) {
        projectDetails.push({ repository: name, repositoryUrl: html_url, ...analysisPart, bestPracticesScore: this.calculateScore(analysisPart) });
      }
    }
    if (projectDetails.length === 0) { return { details: [], summary: { javaVersionCounts: {}, springBootVersionCounts: {}, bestProject: null, worstProject: null } }; }
    const javaVersionCounts = projectDetails.reduce((acc, cur) => { const v = cur.details['Java Version']; if (v) acc[v] = (acc[v] || 0) + 1; return acc; }, {} as Record<string, number>);
    const springBootVersionCounts = projectDetails.reduce((acc, cur) => { const v = cur.details['Spring Boot Version']; if (v) acc[v] = (acc[v] || 0) + 1; return acc; }, {} as Record<string, number>);
    const sortedByScore = [...projectDetails].sort((a, b) => b.bestPracticesScore - a.bestPracticesScore);
    return {
      details: projectDetails,
      summary: { javaVersionCounts, springBootVersionCounts, bestProject: sortedByScore[0], worstProject: sortedByScore[sortedByScore.length - 1] },
    };
  }
  
  private async _fetchUserRepos(): Promise<{ name: string; owner: { login: string }; html_url: string; }[]> {
    this.logger.info(`Fetching repository list for user: ${this.githubUsername}`);
    const reposUrl = `https://api.github.com/users/${this.githubUsername}/repos?per_page=100`;
    const response = await fetch(reposUrl, { headers: { Authorization: `token ${this.githubToken}` } });
    if (!response.ok) { 
      this.logger.error(`Failed to fetch repositories for ${this.githubUsername}`);
      throw new Error(`Failed to fetch repositories`); 
    }
    return response.json();
  }

  private calculateScore(analysis: Omit<ProjectAnalysisDetail, 'repository' | 'repositoryUrl' | 'bestPracticesScore'>): number {
    let score = 0;
    if (analysis.details['Java Version']) score += 10;
    if (analysis.details['Spring Boot Version']) score += 10;
    if ((analysis.details['Dependency Count'] as number) > 2) score += 5;
    return score;
  }
}