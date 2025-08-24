import React, { useEffect, useState } from 'react';
import { useApi, configApiRef } from '@backstage/core-plugin-api';
import {
  Content,
  Header,
  Page,
  Table,
  TableColumn,
  Progress,
  InfoCard,
  Link,
} from '@backstage/core-components';
import { Grid, Typography, Chip, Tooltip, Card, CardContent, Box, Divider, IconButton, Collapse } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { BugReport, Security, Code, Description, FileCopy, ExpandMore } from '@material-ui/icons';

interface EntityScore {
  tableData: any;
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

const useStyles = makeStyles((theme) => ({
  leaderboardCard: {
    marginBottom: theme.spacing(3),
    boxShadow: theme.shadows[4],
    borderRadius: theme.spacing(1),
  },
  rankBadge: {
    marginRight: theme.spacing(1),
    fontWeight: 'bold',
    color: 'white',
  },
  gold: {
    backgroundColor: '#FFD700',
    color: '#000',
  },
  silver: {
    backgroundColor: '#C0C0C0',
    color: '#000',
  },
  bronze: {
    backgroundColor: '#CD7F32',
    color: '#fff',
  },
  blackRank: {
    backgroundColor: '#000000',
    color: '#FFFFFF',
  },
  scoreText: {
    fontSize: '1.0rem',
    fontWeight: 'bold',
  },
  totalScoreText: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  legendContent: {
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.default,
  },
  metricCard: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    transition: 'transform 0.2s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[6],
    },
  },
  metricIcon: {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
  metricTitle: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
  expandButton: {
    transform: 'rotate(0deg)',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.short,
    }),
  },
  expandButtonOpen: {
    transform: 'rotate(180deg)',
  },
}));

const getScoreColor = (scoreStr: string): string => {
  const score = parseFloat(scoreStr.replace('%', ''));
  if (score >= 80) return 'green';
  if (score >= 60) return 'orange';
  return 'red';
};

const getRankStyle = (index: number, classes: any) => {
  if (index === 0) return classes.gold;
  if (index === 1) return classes.silver;
  if (index === 2) return classes.bronze;
  return classes.blackRank;
};

const getTooltipText = (metric: string, scoreStr: string): string => {
  const score = parseFloat(scoreStr.replace('%', ''));
  switch (metric) {
    case 'bugs':
      if (score === 95) return 'Bugs Score: 95% (Reliability Rating 1 - Excellent reliability, minimal bugs)';
      if (score === 80) return 'Bugs Score: 80% (Reliability Rating 2)';
      if (score === 60) return 'Bugs Score: 60% (Reliability Rating 3)';
      if (score === 40) return 'Bugs Score: 40% (Reliability Rating 4)';
      if (score === 20) return 'Bugs Score: 20% (Reliability Rating 5)';
      if (score === 100) return 'Bugs Score: 100% (No bugs detected)';
      if (score === 90) return 'Bugs Score: 90% (≤5 bugs)';
      if (score === 75) return 'Bugs Score: 75% (≤10 bugs)';
      if (score === 50) return 'Bugs Score: 50% (≤20 bugs)';
      if (score === 25) return 'Bugs Score: 25% (≤50 bugs)';
      return 'Bugs Score: 10% (>50 bugs)';
    case 'vulnerabilities':
      if (score === 95) return 'Vulnerabilities Score: 95% (Security Rating 1 - No significant security issues)';
      if (score === 80) return 'Vulnerabilities Score: 80% (Security Rating 2)';
      if (score === 60) return 'Vulnerabilities Score: 60% (Security Rating 3)';
      if (score === 40) return 'Vulnerabilities Score: 40% (Security Rating 4)';
      if (score === 20) return 'Vulnerabilities Score: 20% (Security Rating 5)';
      if (score === 100) return 'Vulnerabilities Score: 100% (No vulnerabilities)';
      if (score === 85) return 'Vulnerabilities Score: 85% (≤2 vulnerabilities)';
      if (score === 65) return 'Vulnerabilities Score: 65% (≤5 vulnerabilities)';
      if (score === 45) return 'Vulnerabilities Score: 45% (≤10 vulnerabilities)';
      return 'Vulnerabilities Score: 25% (>10 vulnerabilities)';
    case 'codeSmells':
      if (score === 95) return 'Code Smells Score: 95% (Maintainability Rating 1 - High maintainability)';
      if (score === 80) return 'Code Smells Score: 80% (Maintainability Rating 2)';
      if (score === 60) return 'Code Smells Score: 60% (Maintainability Rating 3)';
      if (score === 40) return 'Code Smells Score: 40% (Maintainability Rating 4)';
      if (score === 20) return 'Code Smells Score: 20% (Maintainability Rating 5)';
      if (score === 100) return 'Code Smells Score: 100% (≤10 code smells)';
      if (score === 85) return 'Code Smells Score: 85% (≤50 code smells)';
      if (score === 70) return 'Code Smells Score: 70% (≤100 code smells)';
      if (score === 55) return 'Code Smells Score: 55% (≤200 code smells)';
      if (score === 40) return 'Code Smells Score: 40% (≤500 code smells)';
      return 'Code Smells Score: 25% (>500 code smells)';
    case 'documentation':
      return `Coverage Score: ${score}% (Percentage of code covered by tests)`;
    case 'duplications':
      return `Duplications Score: ${score}% (Calculated as 100 - duplicated lines density)`;
    case 'total':
      return `Total Score: ${score}% (Average of Bugs, Vulnerabilities, Code Smells, Coverage, and Duplications scores)`;
    default:
      return '';
  }
};

export const ScoreBoardPage = () => {
  const [scores, setScores] = useState<EntityScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const classes = useStyles();
  const configApi = useApi(configApiRef);

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  useEffect(() => {
    const fetchScores = async () => {
      try {
        setLoading(true);
        const backendUrl = configApi.getOptionalString('backend.baseUrl') || 'http://localhost:7007';
        const response = await fetch(`${backendUrl}/api/scoreboard/entity-scores`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch scores: ${response.statusText}`);
        }
        
        const data = await response.json();
        setScores(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error fetching scoreboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
    const interval = setInterval(fetchScores, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [configApi]);

  const columns: TableColumn<EntityScore>[] = [
    {
      title: 'Rank',
      render: (rowData) => (
        <Chip
          label={`#${rowData.tableData.id + 1}`}
          size="small"
          className={`${classes.rankBadge} ${getRankStyle(rowData.tableData.id, classes)}`}
        />
      ),
      width: '80px',
    },
    {
      title: 'Repository',
      field: 'name',
      highlight: true,
      render: (row) => (
        <div>
          <Link to={`/catalog/default/component/${row.name}`}>
            <Typography variant="subtitle2">{row.name}</Typography>
          </Link>
          <Typography variant="caption" color="textSecondary">
            {row.kind} • Owner: {row.owner}
          </Typography>
        </div>
      ),
    },
    {
      title: 'Last Updated',
      field: 'date',
      width: '120px',
    },
    {
      title: 'Code Quality',
      field: 'bugs',
      render: (row) => (
        <Tooltip title={getTooltipText('bugs', row.bugs)} placement="top">
          <span
            className={classes.scoreText}
            style={{ color: getScoreColor(row.bugs) }}
          >
            {row.bugs}
          </span>
        </Tooltip>
      ),
      width: '80px',
    },
    {
      title: 'Coverage',
      field: 'documentation',
      render: (row) => (
        <Tooltip title={getTooltipText('documentation', row.documentation)} placement="top">
          <span
            className={classes.scoreText}
            style={{ color: getScoreColor(row.documentation) }}
          >
            {row.documentation}
          </span>
        </Tooltip>
      ),
      width: '100px',
    },
    {
      title: 'Vulnerabilities',
      field: 'vulnerabilities',
      render: (row) => (
        <Tooltip title={getTooltipText('vulnerabilities', row.vulnerabilities)} placement="top">
          <span
            className={classes.scoreText}
            style={{ color: getScoreColor(row.vulnerabilities) }}
          >
            {row.vulnerabilities}
          </span>
        </Tooltip>
      ),
      width: '120px',
    },
    {
      title: 'Code Smells',
      field: 'codeSmells',
      render: (row) => (
        <Tooltip title={getTooltipText('codeSmells', row.codeSmells)} placement="top">
          <span
            className={classes.scoreText}
            style={{ color: getScoreColor(row.codeSmells) }}
          >
            {row.codeSmells}
          </span>
        </Tooltip>
      ),
      width: '110px',
    },
    {
      title: 'Duplications',
      field: 'duplications',
      render: (row) => (
        <Tooltip title={getTooltipText('duplications', row.duplications)} placement="top">
          <span
            className={classes.scoreText}
            style={{ color: getScoreColor(row.duplications) }}
          >
            {row.duplications}
          </span>
        </Tooltip>
      ),
      width: '110px',
    },
    {
      title: 'Total Score',
      field: 'total',
      render: (row) => (
        <Tooltip title={getTooltipText('total', row.total)} placement="top">
          <Typography
            className={classes.totalScoreText}
            style={{ color: getScoreColor(row.total) }}
          >
            {row.total}
          </Typography>
        </Tooltip>
      ),
      width: '120px',
    },
  ];

  const sortedScores = [...scores].sort((a, b) => {
    const scoreA = parseFloat(a.total.replace('%', ''));
    const scoreB = parseFloat(b.total.replace('%', ''));
    return scoreB - scoreA;
  });

  const avgScore = scores.length > 0 
    ? scores.reduce((sum, score) => sum + parseFloat(score.total.replace('%', '')), 0) / scores.length 
    : 0;

  if (loading) {
    return (
      <Page themeId="tool">
        <Header title="Sysco Leaderboard" subtitle="Loading repository metrics..." />
        <Content>
          <Progress />
        </Content>
      </Page>
    );
  }

  if (error) {
    return (
      <Page themeId="tool">
        <Header title="Sysco Leaderboard" subtitle="Error loading data" />
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
        title="Sysco Leaderboard" 
        subtitle={`Code quality rankings for ${scores.length} repositories`}
      />
      <Content>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <InfoCard title="Scoring Mechanism" className={classes.leaderboardCard}>
              <Box display="flex" alignItems="center" justifyContent="space-between" padding={2}>
                <Box>
                  <Typography variant="h5" gutterBottom>
                    How Metrics Are Defined
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Explore the key metrics used to evaluate repository quality, based on SonarCloud analysis.
                  </Typography>
                </Box>
                <IconButton
                  className={`${classes.expandButton} ${expanded ? classes.expandButtonOpen : ''}`}
                  onClick={handleToggle}
                  aria-expanded={expanded}
                  aria-label="show more"
                >
                  <ExpandMore />
                </IconButton>
              </Box>
              <Collapse in={expanded} timeout="auto">
                <div className={classes.legendContent}>
                  <Divider className={classes.divider} />
                  <Card className={classes.metricCard}>
                    <CardContent>
                      <Box className={classes.metricTitle}>
                        <BugReport className={classes.metricIcon} />
                        <Typography variant="h6">Code Quality</Typography>
                      </Box>
                      <Typography variant="body2" paragraph>
                        Measures code reliability based on the number of bugs and SonarCloud's reliability rating.
                      </Typography>
                      <Typography variant="body2" paragraph>
                        - With reliability rating: 1 = 95% (Excellent), 2 = 80%, 3 = 60%, 4 = 40%, 5 = 20%, Default = 50%.<br />
                        - Without rating: 0 bugs = 100%, ≤5 bugs = 90%, ≤10 bugs = 75%, ≤20 bugs = 50%, ≤50 bugs = 25%, {'>'}50 bugs = 10%.
                      </Typography>
                    </CardContent>
                  </Card>
                  <Card className={classes.metricCard}>
                    <CardContent>
                      <Box className={classes.metricTitle}>
                        <Security className={classes.metricIcon} />
                        <Typography variant="h6">Vulnerabilities Score</Typography>
                      </Box>
                      <Typography variant="body2" paragraph>
                        Assesses security based on the number of vulnerabilities and SonarCloud's security rating.
                      </Typography>
                      <Typography variant="body2" paragraph>
                        - With security rating: 1 = 95% (No significant issues), 2 = 80%, 3 = 60%, 4 = 40%, 5 = 20%, Default = 50%.<br />
                        - Without rating: 0 vulnerabilities = 100%, ≤2 = 85%, ≤5 = 65%, ≤10 = 45%, {'>'}10 = 25%.
                      </Typography>
                    </CardContent>
                  </Card>
                  <Card className={classes.metricCard}>
                    <CardContent>
                      <Box className={classes.metricTitle}>
                        <Code className={classes.metricIcon} />
                        <Typography variant="h6">Code Smells Score</Typography>
                      </Box>
                      <Typography variant="body2" paragraph>
                        Evaluates maintainability based on the number of code smells and SonarCloud's maintainability rating.
                      </Typography>
                      <Typography variant="body2" paragraph>
                        - With maintainability rating: 1 = 95% (High maintainability), 2 = 80%, 3 = 60%, 4 = 40%, 5 = 20%, Default = 50%.<br />
                        - Without rating: ≤10 code smells = 100%, ≤50 = 85%, ≤100 = 70%, ≤200 = 55%, ≤500 = 40%, {'>'}500 = 25%.
                      </Typography>
                    </CardContent>
                  </Card>
                  <Card className={classes.metricCard}>
                    <CardContent>
                      <Box className={classes.metricTitle}>
                        <Description className={classes.metricIcon} />
                        <Typography variant="h6">Coverage Score</Typography>
                      </Box>
                      <Typography variant="body2" paragraph>
                        Represents the percentage of code covered by tests, directly taken from SonarCloud (e.g., 95% means 95% coverage).
                      </Typography>
                    </CardContent>
                  </Card>
                  <Card className={classes.metricCard}>
                    <CardContent>
                      <Box className={classes.metricTitle}>
                        <FileCopy className={classes.metricIcon} />
                        <Typography variant="h6">Duplications Score</Typography>
                      </Box>
                      <Typography variant="body2" paragraph>
                        Calculated as 100 minus the duplicated lines density (e.g., 5% duplicated lines = 95% score).
                      </Typography>
                    </CardContent>
                  </Card>
                  <Card className={classes.metricCard}>
                    <CardContent>
                      <Box className={classes.metricTitle}>
                        <Typography variant="h6">Total Score</Typography>
                      </Box>
                      <Typography variant="body2" paragraph>
                        The average of Bugs, Vulnerabilities, Code Smells, Coverage, and Duplications scores (e.g., [95 + 95 + 85 + 90 + 95] / 5 = 92%).
                      </Typography>
                    </CardContent>
                  </Card>
                </div>
              </Collapse>
            </InfoCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <InfoCard title="Total Repositories" className={classes.leaderboardCard}>
              <Typography variant="h4">{scores.length}</Typography>
            </InfoCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <InfoCard title="Average Score" className={classes.leaderboardCard}>
              {/* <Tooltip title={getTooltipText('total', `${avgScore}%`)} placement="top"> */}
                <Typography 
                  variant="h4" 
                  style={{ color: getScoreColor(`${avgScore}%`) }}
                >
                  {avgScore.toFixed(1)}%
                </Typography>
              {/* </Tooltip> */}
            </InfoCard>
          </Grid>
          <Grid item xs={12} md={8}>
            <InfoCard title="Top Performer" className={classes.leaderboardCard}>
              {sortedScores.length > 0 && (
                <div>
                  <Link to={`/catalog/default/component/${sortedScores[0].name}`}>
                    <Typography variant="h6">{sortedScores[0].name}</Typography>
                  </Link>
                  {/* <Tooltip title={getTooltipText('total', sortedScores[0].total)} placement="top"> */}
                    <Typography 
                      variant="h4" 
                      style={{ color: getScoreColor(sortedScores[0].total) }}
                    >
                      {sortedScores[0].total}
                    </Typography>
                  {/* </Tooltip> */}
                </div>
              )}
            </InfoCard>
          </Grid>
          <Grid item xs={12}>
            <Table
              title="Leaderboard Rankings"
              options={{
                search: true,
                paging: true,
                pageSize: 20,
                pageSizeOptions: [10, 20, 50],
                toolbar: true,
              }}
              columns={columns}
              data={sortedScores}
              emptyContent={
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <Typography variant="h6" color="textSecondary">
                    No repository data available
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Check if your repositories are configured for SonarCloud analysis
                  </Typography>
                </div>
              }
            />
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};