import React from 'react';
import { Grid, Button } from '@material-ui/core';
// ---> THE FIX IS HERE: We no longer try to import HeaderAction <---
import { Header, Page, Content, Sidebar, SidebarItem } from '@backstage/core-components';
import { Routes, Route, Link as RouterLink } from 'react-router-dom';

// Import your page components
import { GitHubRepos } from '../GitHubRepos'; 
import { ProjectAnalysisPage } from '../ProjectAnalysisPage';
import { UpgradeDashboardPage } from '../UpgradeDashboardPage';

// Import icons
import AllInclusiveIcon from '@material-ui/icons/AllInclusive';
import CompareArrowsIcon from '@material-ui/icons/CompareArrows';
import BarChartIcon from '@material-ui/icons/BarChart';
import DescriptionIcon from '@material-ui/icons/Description';
import FeedbackIcon from '@material-ui/icons/Feedback';

export const VersionScannerPluginpage = () => (
  <Page themeId="tool">
    <Header 
      title="Version Scanner" 
      subtitle="Insights into your organization's repositories"
    >
      {/* ---> THE FIX IS HERE: The Button is placed directly as a child of the Header <--- */}
      {/* The Header component automatically positions its children on the right side. */}
      <Button
        variant="contained"
        color="primary"
        startIcon={<FeedbackIcon />}
        component={RouterLink}
        to="./upgrade-dashboard/feedback"
      >
        Submit Feedback
      </Button>
    </Header>
    <Content>
      <Grid container spacing={3} direction="row">
        <Grid item xs={12} md={2}>
          <Sidebar>
            <SidebarItem icon={AllInclusiveIcon} to="." text="Version Scanner" />
            <SidebarItem icon={CompareArrowsIcon} to="project-analysis" text="Config File Comparison" />
            <SidebarItem icon={BarChartIcon} to="upgrade-dashboard" text="Upgrade Dashboard" />
            
            <SidebarItem
              icon={DescriptionIcon}
              to="https://syscobt.atlassian.net/wiki/x/-inBRAE"
              text="User Guide to upgrade versions"
              target="_blank"
            />
          </Sidebar>
        </Grid>
        <Grid item xs={12} md={12}>
          <Routes>
            <Route path="/*" element={<GitHubRepos />} /> 
            <Route path="/project-analysis" element={<ProjectAnalysisPage />} />
            <Route path="/upgrade-dashboard/*" element={<UpgradeDashboardPage />} />
          </Routes>
        </Grid>
      </Grid>
    </Content>
  </Page>
);