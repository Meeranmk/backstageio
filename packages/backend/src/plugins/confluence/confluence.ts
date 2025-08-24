// packages/backend/src/plugins/confluence/confluence.ts
import { Config } from '@backstage/config';
import express from 'express';
import { Router } from 'express';

export interface RouterOptions {
  config: Config;
}

export class ConfluenceService {
  private readonly baseUrl: string;
  private readonly apiKey: string ;
  private readonly authType: string = 'Basic';

  constructor(config: Config) {
    this.baseUrl = config.getString('confluence.baseUrl');
    this.apiKey = config.getString('confluence.apiKey');
  }

  async getContent(pageId: string): Promise<any> {
    if (!pageId) {
      throw new Error('Page ID is required');
    }

    try {
      console.log('Fetching Confluence content from:', `${this.baseUrl}/rest/api/content/${pageId}?expand=body.storage`);
      const response = await fetch(
        `${this.baseUrl}/rest/api/content/${pageId}?expand=body.storage`,
        {
          headers: {
            Authorization: `${this.authType} ${this.apiKey}`,
            Accept: 'application/json',
          },
        },
      );

      console.log('Confluence API response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Confluence API error details:', errorText);
        throw new Error(`Confluence API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Confluence API response data:', JSON.stringify(data, null, 2));
      return data;
    } catch (error) {
      console.error('Failed to fetch Confluence content:', error);
      throw error;
    }
  }
}

export async function createRouter(options: RouterOptions): Promise<express.Router> {
  const { config } = options;
  const router = Router();
  const confluenceService = new ConfluenceService(config);

  router.get('/content', express.json(), async (req, res) => {
    try {
      const pageId = req.query.pageId as string; // Get pageId from query parameter
      console.log('Handling /content request for pageId:', pageId);
      const content = await confluenceService.getContent(pageId);
      res.json(content);
    } catch (error) {
      console.error('Error in /content endpoint:', error);
      res.status(500).json({
        error: 'Failed to fetch Confluence content',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  return router;
}