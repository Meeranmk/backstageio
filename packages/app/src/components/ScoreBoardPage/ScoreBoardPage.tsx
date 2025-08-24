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
import { Grid, Typography, Chip, Tooltip, Card, CardContent, Box, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { BugReport, Security, Code, Description, FileCopy, ArrowBack, ArrowForward, TrendingUp, Assessment, Star } from '@material-ui/icons';

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
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  statsCard: {
    height: 160,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    background: `linear-gradient(135deg, ${theme.palette.primary.light}20 0%, ${theme.palette.primary.main}10 100%)`,
    border: `1px solid ${theme.palette.primary.light}40`,
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[8],
      background: `linear-gradient(135deg, ${theme.palette.primary.light}30 0%, ${theme.palette.primary.main}20 100%)`,
    },
  },
  statsIcon: {
    fontSize: '2.5rem',
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(1),
  },
  statsValue: {
    fontSize: '2.2rem',
    fontWeight: 'bold',
    marginBottom: theme.spacing(0.5),
  },
  statsLabel: {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  scoringMechanismCard: {
    background: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[2],
  },
  scoringHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
    paddingBottom: theme.spacing(2),
    borderBottom: `2px solid ${theme.palette.primary.main}`,
    background: `linear-gradient(135deg, ${theme.palette.primary.light}15 0%, ${theme.palette.primary.main}10 100%)`,
    margin: theme.spacing(-3, -3, 3, -3),
    padding: theme.spacing(2, 3),
    borderRadius: `${theme.spacing(1)}px ${theme.spacing(1)}px 0 0`,
  },
  scoringHeaderIcon: {
    fontSize: '2rem',
    color: theme.palette.primary.main,
    marginRight: theme.spacing(1.5),
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
  carouselContainer: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    marginTop: theme.spacing(2),
    paddingLeft: theme.spacing(6),
    paddingRight: theme.spacing(6),
  },
  carouselInner: {
    display: 'flex',
    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  carouselItem: {
    minWidth: '100%',
    boxSizing: 'border-box',
    padding: theme.spacing(0, 1),
  },
  metricCard: {
    background: theme.palette.background.paper,
    border: `2px solid ${theme.palette.divider}`,
    borderRadius: theme.spacing(2),
    transition: 'all 0.3s ease',
    margin: theme.spacing(0, 1),
    boxShadow: theme.shadows[1],
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[4],
      borderColor: theme.palette.primary.main,
    },
  },
  metricIcon: {
    fontSize: '1.75rem',
    color: theme.palette.primary.main,
    marginRight: theme.spacing(1.5),
    padding: theme.spacing(0.5),
    backgroundColor: `${theme.palette.primary.light}20`,
    borderRadius: '50%',
  },
  metricTitle: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
    paddingBottom: theme.spacing(1.5),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  metricDescription: {
    marginBottom: theme.spacing(2),
    color: '#000000',
    fontSize: '0.95rem',
    lineHeight: 1.6,
    fontWeight: 500,
  },
  metricDetails: {
    color: '#000000',
    fontSize: '0.875rem',
    lineHeight: 1.5,
    padding: theme.spacing(1.5),
    backgroundColor: theme.palette.grey[50],
    borderRadius: theme.spacing(1),
    border: `1px solid ${theme.palette.grey[200]}`,
    '& br': {
      marginBottom: theme.spacing(0.5),
    },
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[3],
    border: `2px solid ${theme.palette.primary.main}`,
    color: theme.palette.primary.main,
    width: 44,
    height: 44,
    zIndex: 2,
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      boxShadow: theme.shadows[6],
      transform: 'translateY(-50%) scale(1.05)',
    },
    '&:disabled': {
      opacity: 0.4,
      backgroundColor: theme.palette.grey[200],
      border: `2px solid ${theme.palette.grey[400]}`,
      color: theme.palette.grey[400],
      cursor: 'not-allowed',
      '&:hover': {
        transform: 'translateY(-50%)',
        backgroundColor: theme.palette.grey[200],
        color: theme.palette.grey[400],
      },
    },
  },
  leftButton: {
    left: theme.spacing(1),
  },
  rightButton: {
    right: theme.spacing(1),
  },
  carouselNavigation: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  carouselTitle: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  carouselCounter: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    padding: theme.spacing(0.5, 1.5),
    borderRadius: theme.spacing(3),
    fontSize: '0.875rem',
    fontWeight: 'bold',
    minWidth: 60,
    textAlign: 'center',
  },
  carouselIndicators: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(2),
    gap: theme.spacing(1),
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: theme.palette.grey[400],
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&.active': {
      backgroundColor: theme.palette.primary.main,
      transform: 'scale(1.2)',
    },
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
      if (score === 95) return 'Bugs Score: 95% (Reliability Rating 1 - Excellent reliability)';
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

const metrics = [
  {
    icon: <BugReport />,
    title: 'Code Quality',
    description: 'Measures code reliability based on the number of bugs and SonarCloud\'s reliability rating.',
    details: '• With reliability rating: 1 = 95% (Excellent), 2 = 80%, 3 = 60%, 4 = 40%, 5 = 20%, Default = 50%.<br />• Without rating: 0 bugs = 100%, ≤5 bugs = 90%, ≤10 bugs = 75%, ≤20 bugs = 50%, ≤50 bugs = 25%, >50 bugs = 10%.',
  },
  {
    icon: <Security />,
    title: 'Vulnerabilities Score',
    description: 'Assesses security based on the number of vulnerabilities and SonarCloud\'s security rating.',
    details: '• With security rating: 1 = 95% (No significant issues), 2 = 80%, 3 = 60%, 4 = 40%, 5 = 20%, Default = 50%.<br />• Without rating: 0 vulnerabilities = 100%, ≤2 = 85%, ≤5 = 65%, ≤10 = 45%, >10 = 25%.',
  },
  {
    icon: <Code />,
    title: 'Code Smells Score',
    description: 'Evaluates maintainability based on the number of code smells and SonarCloud\'s maintainability rating.',
    details: '• With maintainability rating: 1 = 95% (High maintainability), 2 = 80%, 3 = 60%, 4 = 40%, 5 = 20%, Default = 50%.<br />• Without rating: ≤10 code smells = 100%, ≤50 = 85%, ≤100 = 70%, ≤200 = 55%, ≤500 = 40%, >500 = 25%.',
  },
  {
    icon: <Description />,
    title: 'Coverage Score',
    description: 'Represents the percentage of code covered by tests, directly taken from SonarCloud (e.g., 95% means 95% coverage).',
    details: '',
  },
  {
    icon: <FileCopy />,
    title: 'Duplications Score',
    description: 'Calculated as 100 minus the duplicated lines density (e.g., 5% duplicated lines = 95% score).',
    details: '',
  },
  {
    icon: <Assessment />,
    title: 'Total Score',
    description: 'The weighted average of Bugs, Documentation, Vulnerabilities, Code Smells, and Duplications scores using the weights: Bugs 25%, Documentation 15%, Vulnerabilities 25%, Code Smells 20%, Duplications 15%. For example, Total Score = (Bugs * 0.25) + (Documentation * 0.15) + (Vulnerabilities * 0.25) + (Code Smells * 0.20) + (Duplications * 0.15)',
    details: '',
  },
];

export const ScoreBoardPage = () => {
  const [scores, setScores] = useState<EntityScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMetricIndex, setCurrentMetricIndex] = useState(0);
  const classes = useStyles();
  const configApi = useApi(configApiRef);

  const handleNext = () => {
    setCurrentMetricIndex((prevIndex) => (prevIndex + 1) % metrics.length);
  };

  const handlePrev = () => {
    setCurrentMetricIndex((prevIndex) => (prevIndex - 1 + metrics.length) % metrics.length);
  };

  const goToSlide = (index: number) => {
    setCurrentMetricIndex(index);
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
          {/* Enhanced Scoring Mechanism Card */}
          <Grid item xs={12}>
            <InfoCard title="" className={`${classes.leaderboardCard} ${classes.scoringMechanismCard}`}>
              <Box padding={3}>
                <Box className={classes.scoringHeader}>
                  <Assessment className={classes.scoringHeaderIcon} />
                  <Typography variant="h5">Scoring Mechanism <br />
                  {/* <Typography
                  variant="body1"
                  paragraph
                  style={{ fontSize: '1rem', lineHeight: 1.9, fontWeight: 500, color: '#000000' }}
                > Below is the key metrics from different source systems like SonarQube that are used to decide the Leaderboard.  </Typography> */}
                
                 </Typography>
                  
                </Box>

                <Typography
                  variant="body1"
                  paragraph
                  style={{ fontSize: '1rem', lineHeight: 1.6, fontWeight: 500, color: '#000000' }}
                >
                  Below is the key metrics from different source systems like SonarQube that are used to decide the Leaderboard.
                </Typography>



                <Box className={classes.carouselContainer}>
                  {/* Enhanced Navigation with Counter */}
                  <Box className={classes.carouselNavigation}>
                    <IconButton
                      className={classes.navButton}
                      onClick={handlePrev}
                      disabled={currentMetricIndex === 0}
                      style={{ position: 'relative', left: 0, top: 0, transform: 'none' }}
                    >
                      <ArrowBack />
                    </IconButton>

                    <Box className={classes.carouselTitle}>
                      <Typography variant="h6" style={{ marginRight: 16 }}>
                        Metrics Overview
                      </Typography>
                      <Box className={classes.carouselCounter}>
                        {currentMetricIndex + 1} / {metrics.length}
                      </Box>
                    </Box>

                    <IconButton
                      className={classes.navButton}
                      onClick={handleNext}
                      disabled={currentMetricIndex === metrics.length - 1}
                      style={{ position: 'relative', right: 0, top: 0, transform: 'none' }}
                    >
                      <ArrowForward />
                    </IconButton>
                  </Box>

                  <Box
                    className={classes.carouselInner}
                    style={{ transform: `translateX(-${currentMetricIndex * 100}%)` }}
                  >
                    {metrics.map((metric, index) => (
                      <Box key={index} className={classes.carouselItem}>
                        <Card className={classes.metricCard}>
                          <CardContent>
                            <Box className={classes.metricTitle}>
                              {metric.icon && <Box className={classes.metricIcon}>{metric.icon}</Box>}
                              <Typography variant="h6" style={{ fontWeight: 600, color: '#000000' }}>
                                {metric.title}
                              </Typography>
                            </Box>
                            <Typography variant="body2" className={classes.metricDescription}>
                              {metric.description}
                            </Typography>
                            {metric.details && (
                              <Typography variant="body2" className={classes.metricDetails}>
                                <span dangerouslySetInnerHTML={{ __html: metric.details }} />
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* Carousel Indicators */}
                <Box className={classes.carouselIndicators}>
                  {metrics.map((_, index) => (
                    <Box
                      key={index}
                      className={`${classes.indicator} ${index === currentMetricIndex ? 'active' : ''}`}
                      onClick={() => goToSlide(index)}
                    />
                  ))}
                </Box>
              </Box>
            </InfoCard>
          </Grid>

          {/* Enhanced Stats Cards with uniform height and weight */}
          <Grid item xs={12} md={4}>
            <Card className={`${classes.leaderboardCard} ${classes.statsCard}`}>
              <CardContent style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <TrendingUp className={classes.statsIcon} />
                <Typography className={classes.statsValue}>
                  {scores.length}
                </Typography>
                <Typography className={classes.statsLabel}>
                  Total Repositories
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card className={`${classes.leaderboardCard} ${classes.statsCard}`}>
              <CardContent style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Assessment className={classes.statsIcon} />
                <Typography
                  className={classes.statsValue}
                  style={{ color: getScoreColor(`${avgScore}%`) }}
                >
                  {avgScore.toFixed(1)}%
                </Typography>
                <Typography className={classes.statsLabel}>
                  Average Score
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card className={`${classes.leaderboardCard} ${classes.statsCard}`}>
              <CardContent style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Star className={classes.statsIcon} />
                {sortedScores.length > 0 && (
                  <>
                    <Link to={`/catalog/default/component/${sortedScores[0].name}`}>
                      <Typography variant="h6" style={{ marginBottom: 4, textAlign: 'center' }}>
                        {sortedScores[0].name}
                      </Typography>
                    </Link>
                    <Typography
                      className={classes.statsValue}
                      style={{ color: getScoreColor(sortedScores[0].total) }}
                    >
                      {sortedScores[0].total}
                    </Typography>
                  </>
                )}
                <Typography className={classes.statsLabel}>
                  Top Performer
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Leaderboard Table */}
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