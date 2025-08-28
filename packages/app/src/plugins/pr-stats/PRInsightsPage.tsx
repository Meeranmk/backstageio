import { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions, // Import ChartOptions for type safety
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

// Import JSON data
import prData from './data/prData.json';
console.log('prData loaded:', prData); // Debug log

// Define styles using makeStyles
const useStyles = makeStyles((theme) => ({
  container: {
    padding: theme.spacing(3),
    backgroundColor: theme.palette.grey[100],
    minHeight: '100vh',
  },
  mainTitle: {
    marginBottom: theme.spacing(3),
    fontWeight: 'bold',
    fontFamily: 'Inter, Roboto, sans-serif',
    color: theme.palette.text.primary,
    backgroundColor: 'rgba(200, 220, 240, 0.3)',
    padding: theme.spacing(1.5),
    borderRadius: theme.spacing(1),
    display: 'inline-block',
  },
  title: {
    marginBottom: theme.spacing(3),
    fontWeight: 'bold',
    fontFamily: 'Inter, Roboto, sans-serif',
    color: theme.palette.text.primary,
  },
  card: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(3),
    borderRadius: theme.spacing(1),
    boxShadow: theme.shadows[3],
    backgroundColor: theme.palette.background.paper,
  },
  statCard: {
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    boxShadow: theme.shadows[2],
    textAlign: 'center',
    backgroundColor: theme.palette.background.paper,
  },
  statCardTotal: {
    backgroundColor: 'rgba(220, 240, 220, 0.5)',
  },
  statCardManual: {
    backgroundColor: 'rgba(240, 220, 220, 0.5)',
  },
  statCardCopilot: {
    backgroundColor: 'rgba(220, 220, 240, 0.5)',
  },
  statTitle: {
    fontFamily: 'Inter, Roboto, sans-serif',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: theme.palette.text.secondary,
  },
  statValue: {
    fontFamily: 'Inter, Roboto, sans-serif',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: theme.palette.text.primary,
  },
  tableHeader: {
    fontWeight: 'bold',
    fontSize: '0.9rem',
    fontFamily: 'Inter, Roboto, sans-serif',
    color: theme.palette.text.primary,
  },
  tableCell: {
    fontSize: '0.8rem',
    fontFamily: 'Inter, Roboto, sans-serif',
    color: theme.palette.text.secondary,
  },
  chartTitle: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    fontWeight: 'bold',
    fontFamily: 'Inter, Roboto, sans-serif',
    fontSize: '1.1rem',
    color: theme.palette.text.primary,
  },
  errorText: {
    color: theme.palette.error.main,
    fontSize: '1.0rem',
    fontFamily: 'Inter, Roboto, sans-serif',
  },
  countText: {
    fontFamily: 'Inter, Roboto, sans-serif',
    fontSize: '0.9rem',
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(3),
  },
}));

// Interfaces for type safety
interface PRCount {
  'Review Type': string;
  [key: string]: string | number; // Index signature for dynamic date keys
}

interface PRTableData {
  weeks: string[];
  manual: number[];
  copilot: number[];
}

interface TimeTableData {
  months: string[];
  manualResponse: number[];
  copilotResponse: number[];
  manualApprove: number[];
  copilotApprove: number[];
  manualMerge: number[];
  copilotMerge: number[];
}

interface CommentTableData {
  weeks: string[];
  indentation: number[];
  variableNaming: number[];
  syntaxError: number[];
  logic: number[];
  bestPractices: number[];
}

export const PRInsightsPage = () => {
  const classes = useStyles();
  const [prTableData, setPrTableData] = useState<PRTableData>({ weeks: [], manual: [], copilot: [] });
  const [timeTableData, setTimeTableData] = useState<TimeTableData>({
    months: [],
    manualResponse: [],
    copilotResponse: [],
    manualApprove: [],
    copilotApprove: [],
    manualMerge: [],
    copilotMerge: [],
  });
  const [commentTableData, setCommentTableData] = useState<CommentTableData>({
    weeks: [],
    indentation: [],
    variableNaming: [],
    syntaxError: [],
    logic: [],
    bestPractices: [],
  });

  useEffect(() => {
    // Process PR Counts
    const prCounts: PRCount[] = prData.pr_counts;
    const weeks = Object.keys(prCounts[0])
      .filter(key => key !== 'Review Type')
      .sort();
    const manualData = weeks.map(week => Number(prCounts[0][week]) || 0);
    const copilotData = weeks.map(week => Number(prCounts[1][week]) || 0);
    setPrTableData({ weeks, manual: manualData, copilot: copilotData });

    // Process Time Metrics
    const timeMetrics = prData.time_metrics;
    const months = timeMetrics.map(tm => tm.Month);
    setTimeTableData({
      months,
      manualResponse: months.map(m => {
        const metric = timeMetrics.find(tm => tm.Month === m);
        return metric ? metric['Avg Manual Review Response Time (min)'] : 0;
      }),
      copilotResponse: months.map(m => {
        const metric = timeMetrics.find(tm => tm.Month === m);
        return metric ? metric['Avg Copilot Review Response Time (min)'] : 0;
      }),
      manualApprove: months.map(m => {
        const metric = timeMetrics.find(tm => tm.Month === m);
        return metric ? metric['Avg Manual Time to Approve (min)'] : 0;
      }),
      copilotApprove: months.map(m => {
        const metric = timeMetrics.find(tm => tm.Month === m);
        return metric ? metric['Avg Copilot Time to Approve (min)'] : 0;
      }),
      manualMerge: months.map(m => {
        const metric = timeMetrics.find(tm => tm.Month === m);
        return metric ? metric['Manual Time to Merge (min)'] : 0;
      }),
      copilotMerge: months.map(m => {
        const metric = timeMetrics.find(tm => tm.Month === m);
        return metric ? metric['Copilot Time to Merge (min)'] : 0;
      }),
    });

    // Process Comment Categories (limited to last 4 weeks)
    const commentCategories = prData.comment_categories;
    const commentWeeks = commentCategories
      .map(cc => cc['Week Ending'])
      .sort()
      .slice(-4); // Get the last 4 weeks
    setCommentTableData({
      weeks: commentWeeks,
      indentation: commentWeeks.map(w => commentCategories.find(cc => cc['Week Ending'] === w)?.Indentation || 0),
      variableNaming: commentWeeks.map(w => commentCategories.find(cc => cc['Week Ending'] === w)?.['Variable Naming'] || 0),
      syntaxError: commentWeeks.map(w => commentCategories.find(cc => cc['Week Ending'] === w)?.['Syntax Error'] || 0),
      logic: commentWeeks.map(w => commentCategories.find(cc => cc['Week Ending'] === w)?.Logic || 0),
      bestPractices: commentWeeks.map(w => commentCategories.find(cc => cc['Week Ending'] === w)?.['Best Practices'] || 0),
    });
  }, []);

  // Color palette for consistent and beautiful visuals
  const colors = {
    manual: 'rgba(231, 76, 60, 0.8)',
    copilot: 'rgba(52, 152, 219, 0.8)',
    indentation: 'rgba(255, 99, 132, 0.8)',
    variableNaming: 'rgba(54, 162, 235, 0.8)',
    syntaxError: 'rgba(255, 206, 86, 0.8)',
    logic: 'rgba(75, 192, 192, 0.8)',
    bestPractices: 'rgba(153, 102, 255, 0.8)',
  };

  // Common chart options for Bar charts
  const commonChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { family: 'Inter, Roboto, sans-serif', size: 12 },
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { family: 'Inter, Roboto, sans-serif', size: 12 },
        bodyFont: { family: 'Inter, Roboto, sans-serif', size: 11 },
        padding: 10,
        cornerRadius: 4,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Inter, Roboto, sans-serif', size: 11 } },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: { family: 'Inter, Roboto, sans-serif', size: 11 },
        },
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
  };

  // Chart options for Line charts
  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { family: 'Inter, Roboto, sans-serif', size: 12 },
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { family: 'Inter, Roboto, sans-serif', size: 12 },
        bodyFont: { family: 'Inter, Roboto, sans-serif', size: 11 },
        padding: 10,
        cornerRadius: 4,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Inter, Roboto, sans-serif', size: 11 } },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: { family: 'Inter, Roboto, sans-serif', size: 11 },
        },
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
  };

  // Chart 1: Weekly PR Counts
  const prChartData = {
    labels: prTableData.weeks,
    datasets: [
      {
        label: 'Manual PRs',
        data: prTableData.manual,
        backgroundColor: colors.manual,
        borderColor: colors.manual.replace('0.8', '1'),
        borderWidth: 1,
        barThickness: 20,
      },
      {
        label: 'Copilot PRs',
        data: prTableData.copilot,
        backgroundColor: colors.copilot,
        borderColor: colors.copilot.replace('0.8', '1'),
        borderWidth: 1,
        barThickness: 20,
      },
    ],
  };

  // Chart 2: Time to Merge
  const mergeChartData = {
    labels: timeTableData.months,
    datasets: [
      {
        label: 'Manual Time to Merge (min)',
        data: timeTableData.manualMerge,
        backgroundColor: colors.manual,
        borderColor: colors.manual.replace('0.8', '1'),
        borderWidth: 1,
        barThickness: 20,
      },
      {
        label: 'Copilot Time to Merge (min)',
        data: timeTableData.copilotMerge,
        backgroundColor: colors.copilot,
        borderColor: colors.copilot.replace('0.8', '1'),
        borderWidth: 1,
        barThickness: 20,
      },
    ],
  };

  // Chart 3: Review Response Time
  const responseChartData = {
    labels: timeTableData.months,
    datasets: [
      {
        label: 'Manual Response Time (min)',
        data: timeTableData.manualResponse,
        backgroundColor: colors.manual,
        borderColor: colors.manual.replace('0.8', '1'),
        borderWidth: 1,
        barThickness: 20,
      },
      {
        label: 'Copilot Response Time (min)',
        data: timeTableData.copilotResponse,
        backgroundColor: colors.copilot,
        borderColor: colors.copilot.replace('0.8', '1'),
        borderWidth: 1,
        barThickness: 20,
      },
    ],
  };

  // Chart 4: Comment Categories
  const commentChartData = {
    labels: commentTableData.weeks,
    datasets: [
      {
        label: 'Indentation',
        data: commentTableData.indentation,
        borderColor: colors.indentation,
        backgroundColor: colors.indentation,
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Variable Naming',
        data: commentTableData.variableNaming,
        borderColor: colors.variableNaming,
        backgroundColor: colors.variableNaming,
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Syntax Error',
        data: commentTableData.syntaxError,
        borderColor: colors.syntaxError,
        backgroundColor: colors.syntaxError,
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Logic',
        data: commentTableData.logic,
        borderColor: colors.logic,
        backgroundColor: colors.logic,
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Best Practices',
        data: commentTableData.bestPractices,
        borderColor: colors.bestPractices,
        backgroundColor: colors.bestPractices,
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // Calculate total PR counts
  const totalPRCount = prTableData.manual.reduce((a, b) => a + b, 0) + prTableData.copilot.reduce((a, b) => a + b, 0);
  const totalManualPRCount = prTableData.manual.reduce((a, b) => a + b, 0);
  const totalCopilotPRCount = prTableData.copilot.reduce((a, b) => a + b, 0);

  return (
    <div className={classes.container}>
      <Typography variant="h4" className={classes.mainTitle}>
        📊 GitHub PR Insights
      </Typography>
      <Grid container spacing={2} style={{ marginBottom: '24px' }}>
        <Grid item xs={12} sm={4}>
          <Card className={`${classes.statCard} ${classes.statCardTotal}`}>
            <Typography className={classes.statTitle}>Total PRs</Typography>
            <Typography className={classes.statValue}>{totalPRCount}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card className={`${classes.statCard} ${classes.statCardManual}`}>
            <Typography className={classes.statTitle}>Manual Reviewed PRs</Typography>
            <Typography className={classes.statValue}>{totalManualPRCount}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card className={`${classes.statCard} ${classes.statCardCopilot}`}>
            <Typography className={classes.statTitle}>Copilot Reviewed PRs</Typography>
            <Typography className={classes.statValue}>{totalCopilotPRCount}</Typography>
          </Card>
        </Grid>
      </Grid>
      <Typography className={classes.countText}>
        **PRs from 18 May 2025 are considered for the calculation
      </Typography>

      {/* Weekly PR Counts */}
      <Card className={classes.card}>
        <Typography variant="h6" className={classes.chartTitle}>
          PR Activity Dashboard: Manual vs Copilot Trends
        </Typography>
        <div style={{ height: '300px' }}>
          <Bar data={prChartData} options={commonChartOptions} />
        </div>
      </Card>

      {/* Time Metrics */}
      <Card className={classes.card}>
        <Typography variant="h6" className={classes.chartTitle}>
          PR Time based metrics: Manual vs Copilot Merge time
        </Typography>
        <div style={{ height: '300px' }}>
          <Bar data={mergeChartData} options={commonChartOptions} />
        </div>
        <Typography variant="h6" className={classes.chartTitle}>
          PR Time based metrics: Manual vs Copilot Review Response Time
        </Typography>
        <div style={{ height: '300px' }}>
          <Bar data={responseChartData} options={commonChartOptions} />
        </div>
      </Card>

      {/* Comment Categories */}
      <Card className={classes.card}>
        <Typography variant="h5" className={classes.title}>
          📈 Categorized PR Quality Metrics (Count of defects)
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className={classes.tableHeader}>Week Ending</TableCell>
                <TableCell className={classes.tableHeader}>Indentation</TableCell>
                <TableCell className={classes.tableHeader}>Variable Naming</TableCell>
                <TableCell className={classes.tableHeader}>Syntax Error</TableCell>
                <TableCell className={classes.tableHeader}>Logic</TableCell>
                <TableCell className={classes.tableHeader}>Best Practices</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {commentTableData.weeks.map((week, index) => (
                <TableRow key={week}>
                  <TableCell className={classes.tableCell}>{week}</TableCell>
                  <TableCell className={classes.tableCell}>{commentTableData.indentation[index]}</TableCell>
                  <TableCell className={classes.tableCell}>{commentTableData.variableNaming[index]}</TableCell>
                  <TableCell className={classes.tableCell}>{commentTableData.syntaxError[index]}</TableCell>
                  <TableCell className={classes.tableCell}>{commentTableData.logic[index]}</TableCell>
                  <TableCell className={classes.tableCell}>{commentTableData.bestPractices[index]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Typography variant="h6" className={classes.chartTitle}>
          PR Quality Metrics per Category - Last 4 Weeks
        </Typography>
        <div style={{ height: '300px' }}>
          <Line data={commentChartData} options={lineChartOptions} />
        </div>
      </Card>
    </div>
  );
};