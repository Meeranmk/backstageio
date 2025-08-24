import React from 'react';
import { TabbedLayout } from '@backstage/core-components';
import { MetricsDashboardComponent } from '../MetricsDashboard/MetricsDashboard';
import { FeedbackFormComponent } from '../MetricsDashboard/FeedbackForm';

export const UpgradeDashboardPage = () => (
  <TabbedLayout>
    <TabbedLayout.Route path="/metrics" title="Metrics Dashboard">
      <MetricsDashboardComponent />
    </TabbedLayout.Route>
    <TabbedLayout.Route path="/feedback" title="Submit Feedback">
      <FeedbackFormComponent />
    </TabbedLayout.Route>
  </TabbedLayout>
);