import React, { useEffect, useState } from 'react';
import { useApi, configApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react'; // Import useEntity
import {
  Content,
  Header,
  Page,
  Progress,
  InfoCard,
} from '@backstage/core-components';
import { Typography } from '@material-ui/core';

interface ConfluenceContent {
  title: string;
  body: {
    storage: {
      value: string;
    };
  };
}

export const ConfluencePage = () => {
  const [content, setContent] = useState<ConfluenceContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const configApi = useApi(configApiRef);
  const { entity } = useEntity(); // Get the current entity

  // Extract Confluence page ID from entity annotations
  const confluencePageId = entity.metadata.annotations?.['confluence/page-id'];

  useEffect(() => {
    const fetchContent = async () => {
      if (!confluencePageId) {
        setError('No Confluence page ID specified in entity annotations');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const backendUrl = configApi.getOptionalString('backend.baseUrl') || 'http://localhost:7007';
        // Pass the page ID as a query parameter
        const response = await fetch(`${backendUrl}/api/confluence/content?pageId=${encodeURIComponent(confluencePageId)}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch Confluence content: ${response.statusText}`);
        }
        
        const data = await response.json();
        setContent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching Confluence content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [configApi, confluencePageId]); // Add confluencePageId to dependencies

  if (loading) {
    return (
      <Page themeId="tool">
        <Header title="Confluence Wiki" subtitle="Loading wiki content..." />
        <Content>
          <Progress />
        </Content>
      </Page>
    );
  }

  if (error) {
    return (
      <Page themeId="tool">
        <Header title="Confluence Wiki" subtitle="Error loading content" />
        <Content>
          <InfoCard title="Error">
            <Typography color="error">{error}</Typography>
          </InfoCard>
        </Content>
      </Page>
    );
  }

  return (
    <Page themeId="tool">
      <Header 
        title="Confluence Wiki" 
        subtitle={content?.title || 'Wiki Page'}
      />
      <Content>
        <InfoCard title={content?.title || 'Confluence Content'}>
          <div
            style={{ overflow: 'auto' }}
            // Note: Use sanitize-html in production to prevent XSS
            dangerouslySetInnerHTML={{ __html: content?.body.storage.value || '' }}
          />
        </InfoCard>
      </Content>
    </Page>
  );
};