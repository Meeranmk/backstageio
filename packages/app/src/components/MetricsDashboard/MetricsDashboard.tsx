// import React, { useEffect, useState } from 'react';
// import { Typography, Grid, List, ListItem, ListItemText } from '@material-ui/core';
// import { InfoCard, Progress } from '@backstage/core-components';
// import { Alert } from '@material-ui/lab';
// // import { UpgradeMetrics } from '../../../../backend/src/plugins/upgradeMetricsService'; // Re-using the type




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

// export const MetricsDashboardComponent = () => {
//   const [metrics, setMetrics] = useState<UpgradeMetrics | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetch('http://localhost:7007/api/version-scanner/upgrade-metrics')
//       .then(res => res.json())
//       .then(json => setMetrics(json.metrics))
//       .finally(() => setLoading(false));
//   }, []);

//   if (loading) return <Progress />;
//   if (!metrics) return <Alert severity="error">Could not load metrics.</Alert>;

//   return (
//     <Grid container spacing={3}>
//       {/* Quantitative Operational Metrics */}
//       <Grid item xs={12}><Typography variant="h5">Operational Metrics</Typography></Grid>
//       <Grid item xs={12} sm={4}><InfoCard title="Upgrades Initiated"><Typography variant="h4">{metrics.upgradesInitiated}</Typography></InfoCard></Grid>
//       <Grid item xs={12} sm={4}><InfoCard title="Upgrades Completed"><Typography variant="h4">{metrics.upgradesCompleted}</Typography></InfoCard></Grid>
//       <Grid item xs={12} sm={4}><InfoCard title="Success Rate"><Typography variant="h4">{metrics.upgradeSuccessRate.toFixed(1)}%</Typography></InfoCard></Grid>
//       <Grid item xs={12} sm={4}><InfoCard title="Avg Time to Upgrade"><Typography variant="h4">{metrics.avgTimeToUpgradeMins.toFixed(1)} mins</Typography></InfoCard></Grid>
//       <Grid item xs={12} sm={4}><InfoCard title="Build Time Improvement"><Typography variant="h4">{Math.abs(metrics.buildTimeImprovementPercent)}% faster</Typography></InfoCard></Grid>
//       <Grid item xs={12} sm={4}><InfoCard title="Total Time Saved"><Typography variant="h4">{metrics.timeSavedHrs} hours</Typography></InfoCard></Grid>

//       {/* User Feedback Metrics */}
//       <Grid item xs={12}><Typography variant="h5" style={{ marginTop: '24px' }}>User Feedback Metrics (Avg)</Typography></Grid>
//       <Grid item xs={12} sm={4}><InfoCard title="Upgrade Ease Score"><Typography variant="h4">{metrics.avgEaseScore}/5</Typography></InfoCard></Grid>
//       <Grid item xs={12} sm={4}><InfoCard title="Docs Helpfulness"><Typography variant="h4">{metrics.avgDocsHelpfulness}/5</Typography></InfoCard></Grid>

//       {/* Qualitative Feedback */}
//       <Grid item xs={12}><Typography variant="h5" style={{ marginTop: '24px' }}>Qualitative Feedback</Typography></Grid>
//       <Grid item xs={12} md={6}>
//         <InfoCard title="Improvement Suggestions">
//           <List>{metrics.improvementSuggestions.map((s, i) => <ListItem key={i}><ListItemText primary={s} /></ListItem>)}</List>
//         </InfoCard>
//       </Grid>
//       <Grid item xs={12} md={6}>
//         <InfoCard title="Reported Bugs">
//           <List>{metrics.reportedBugs.map((b, i) => <ListItem key={i}><ListItemText primary={b} /></ListItem>)}</List>
//         </InfoCard>
//       </Grid>
//     </Grid>
//   );
// };

// import React, { useEffect, useState } from 'react';
// import { Typography, Grid, List, ListItem, ListItemText, Paper, Box, ListItemIcon } from '@material-ui/core';
// import { InfoCard, Progress } from '@backstage/core-components';
// import { Alert } from '@material-ui/lab';
// import { makeStyles, Theme } from '@material-ui/core/styles';

// // We need to import the icons we want to use
// import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
// import TimerIcon from '@material-ui/icons/Timer';
// import TrendingUpIcon from '@material-ui/icons/TrendingUp';
// import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
// import StarBorderIcon from '@material-ui/icons/StarBorder';
// import LiveHelpIcon from '@material-ui/icons/LiveHelp';
// import WbIncandescentIcon from '@material-ui/icons/WbIncandescent';
// import BugReportIcon from '@material-ui/icons/BugReport';

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

// // --- Styling with makeStyles ---
// // This hook provides a clean way to apply styles and use the theme.
// const useStyles = makeStyles((theme: Theme) => ({
//   root: {
//     padding: theme.spacing(3),
//     backgroundColor: theme.palette.background.default,
//   },
//   section: {
//     // This creates the rounded-corner cards with pastel-like backgrounds
//     padding: theme.spacing(2),
//     marginBottom: theme.spacing(3),
//     borderRadius: '16px', // Explicitly setting a larger border radius
//     backgroundColor: theme.palette.background.paper,
//   },
//   metricCard: {
//     display: 'flex',
//     flexDirection: 'column',
//     justifyContent: 'space-between',
//     height: '100%',
//   },
//   metricValue: {
//     fontSize: '2.5rem',
//     fontWeight: 'bold',
//     color: theme.palette.primary.main,
//   },
//   icon: {
//     fontSize: '3rem',
//     color: theme.palette.primary.light,
//     opacity: 0.8,
//   },
// }));

// // --- Helper Component for a single metric card ---
// // This makes our main component much cleaner
// const MetricCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => {
//   const classes = useStyles();
//   return (
//     <InfoCard title={title} className={classes.metricCard}>
//       <Grid container alignItems="center" justifyContent="space-between">
//         <Grid item>
//           <Typography variant="h4" className={classes.metricValue}>
//             {value}
//           </Typography>
//         </Grid>
//         <Grid item>
//           <Box className={classes.icon}>{icon}</Box>
//         </Grid>
//       </Grid>
//     </InfoCard>
//   );
// };


// export const MetricsDashboardComponent = () => {
//   const classes = useStyles(); // Initialize the styles
//   const [metrics, setMetrics] = useState<UpgradeMetrics | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetch('http://localhost:7007/api/version-scanner/upgrade-metrics')
//       .then(res => res.json())
//       .then(json => setMetrics(json.metrics))
//       .finally(() => setLoading(false));
//   }, []);

//   if (loading) return <Progress />;
//   if (!metrics) return <Alert severity="error">Could not load metrics.</Alert>;

//   return (
//     <div className={classes.root}>
//       {/* --- Operational Metrics Section --- */}
//       <Paper elevation={3} className={classes.section}>
//         <Typography variant="h5" gutterBottom>Operational Metrics</Typography>
//         <Grid container spacing={3}>
//           <Grid item xs={12} sm={6} md={4}><MetricCard title="Success Rate" value={`${metrics.upgradeSuccessRate.toFixed(1)}%`} icon={<CheckCircleOutlineIcon />} /></Grid>
//           <Grid item xs={12} sm={6} md={4}><MetricCard title="Avg Time to Upgrade" value={`${metrics.avgTimeToUpgradeHrs.toFixed(1)} hours`} icon={<TimerIcon />} /></Grid>
//           <Grid item xs={12} sm={6} md={4}><MetricCard title="Build Time Improvement" value={`${Math.abs(metrics.buildTimeImprovementPercent)}% faster`} icon={<TrendingUpIcon />} /></Grid>
//           <Grid item xs={12} sm={6} md={4}><MetricCard title="Total Time Saved" value={`${metrics.timeSavedHrs} hours`} icon={<HourglassEmptyIcon />} /></Grid>
//           <Grid item xs={12} sm={6} md={4}><MetricCard title="Upgrades Initiated" value={metrics.upgradesInitiated} icon={<CheckCircleOutlineIcon />} /></Grid>
//           <Grid item xs={12} sm={6} md={4}><MetricCard title="Upgrades Completed" value={metrics.upgradesCompleted} icon={<CheckCircleOutlineIcon />} /></Grid>
//         </Grid>
//       </Paper>

//       {/* --- User Feedback Metrics Section --- */}
//       <Paper elevation={3} className={classes.section}>
//         <Typography variant="h5" gutterBottom>User Feedback (Averages)</Typography>
//         <Grid container spacing={3}>
//           <Grid item xs={12} sm={6} md={4}><MetricCard title="Upgrade Ease Score" value={`${metrics.avgEaseScore}/5`} icon={<StarBorderIcon />} /></Grid>
//           <Grid item xs={12} sm={6} md={4}><MetricCard title="Docs Helpfulness" value={`${metrics.avgDocsHelpfulness}/5`} icon={<LiveHelpIcon />} /></Grid>
//         </Grid>
//       </Paper>

//       {/* --- Qualitative Feedback Section --- */}
//       <Paper elevation={3} className={classes.section}>
//         <Typography variant="h5" gutterBottom>Qualitative Feedback</Typography>
//         <Grid container spacing={3}>
//           <Grid item xs={12} md={6}>
//             <InfoCard title="Improvement Suggestions">
//               <List>
//                 {metrics.improvementSuggestions.map((s, i) => (
//                   <ListItem key={i}>
//                     <ListItemIcon><WbIncandescentIcon color="primary" /></ListItemIcon>
//                     <ListItemText primary={s} />
//                   </ListItem>
//                 ))}
//               </List>
//             </InfoCard>
//           </Grid>
//           <Grid item xs={12} md={6}>
//             <InfoCard title="Reported Bugs">
//               <List>
//                 {metrics.reportedBugs.map((b, i) => (
//                   <ListItem key={i}>
//                     <ListItemIcon><BugReportIcon color="error" /></ListItemIcon>
//                     <ListItemText primary={b} />
//                   </ListItem>
//                 ))}
//               </List>
//             </InfoCard>
//           </Grid>
//         </Grid>
//       </Paper>
//     </div>
//   );
// };

// import React, { useEffect, useState } from 'react';
// import { Typography, Grid, List, ListItem, ListItemText, Paper, Box, ListItemIcon } from '@material-ui/core';
// import { InfoCard, Progress } from '@backstage/core-components';
// import { Alert } from '@material-ui/lab';
// import { makeStyles, Theme } from '@material-ui/core/styles';

// // Import icons
// import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
// import TimerIcon from '@material-ui/icons/Timer';
// import TrendingUpIcon from '@material-ui/icons/TrendingUp';
// import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
// import StarBorderIcon from '@material-ui/icons/StarBorder';
// import LiveHelpIcon from '@material-ui/icons/LiveHelp';
// import WbIncandescentIcon from '@material-ui/icons/WbIncandescent';
// import BugReportIcon from '@material-ui/icons/BugReport';

// // Re-using the type from the backend
// interface UpgradeMetrics {
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

// // Styling with makeStyles
// const useStyles = makeStyles((theme: Theme) => ({
//   root: {
//     padding: theme.spacing(3),
//     backgroundColor: theme.palette.background.default,
//   },
//   section: {
//     padding: theme.spacing(2),
//     marginBottom: theme.spacing(3),
//     borderRadius: '16px',
//     backgroundColor: theme.palette.background.paper,
//   },
//   metricCard: {
//     display: 'flex',
//     flexDirection: 'column',
//     justifyContent: 'space-between',
//     height: '100%',
//   },
//   metricValue: {
//     fontSize: '2.5rem',
//     fontWeight: 'bold',
//     color: theme.palette.primary.main,
//   },
//   icon: {
//     fontSize: '3rem',
//     color: theme.palette.primary.light,
//     opacity: 0.8,
//   },
// }));

// // Helper Component for a single metric card
// const MetricCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => {
//   const classes = useStyles();
//   return (
//     <InfoCard title={title} className={classes.metricCard}>
//       <Grid container alignItems="center" justifyContent="space-between">
//         <Grid item>
//           <Typography variant="h4" className={classes.metricValue}>
//             {value}
//           </Typography>
//         </Grid>
//         <Grid item>
//           <Box className={classes.icon}>{icon}</Box>
//         </Grid>
//       </Grid>
//     </InfoCard>
//   );
// };

// export const MetricsDashboardComponent = () => {
//   const classes = useStyles();
//   const [metrics, setMetrics] = useState<UpgradeMetrics | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<Error | null>(null); // State to hold any fetch errors

//   useEffect(() => {
//     fetch('http://localhost:7007/api/version-scanner/upgrade-metrics')
//       .then(res => {
//         if (!res.ok) {
//           throw new Error(`Network response was not ok: ${res.status}`);
//         }
//         return res.json();
//       })
//       .then(json => {
//         // We now expect the data under the 'metrics' key
//         if (json && json.metrics) {
//           setMetrics(json.metrics);
//         } else {
//           // This helps debug if the response shape is wrong
//           throw new Error("Response JSON did not contain a 'metrics' object.");
//         }
//       })
//       .catch(err => {
//         // Set the error state if something goes wrong
//         setError(err);
//       })
//       .finally(() => {
//         // This runs regardless of success or failure
//         setLoading(false);
//       });
//   }, []);

//   // ---> THE FIX IS HERE <---
//   // We now have three distinct states, and we handle all of them before trying to render.
  
//   // 1. Handle the loading state
//   if (loading) {
//     return <Progress />;
//   }

//   // 2. Handle the error state
//   if (error) {
//     return <Alert severity="error">Could not load metrics: {error.message}</Alert>;
//   }

//   // 3. Handle the "data not found" state (if API returns empty/null)
//   if (!metrics) {
//     return <Alert severity="warning">No metrics data was found.</Alert>;
//   }

//   // If we get past all the checks, we know for sure that `metrics` is a valid object.
//   // The code below can now safely access its properties.
//   return (
//     <div className={classes.root}>
//       {/* --- Operational Metrics Section --- */}
//       <Paper elevation={3} className={classes.section}>
//         <Typography variant="h5" gutterBottom>Operational Metrics</Typography>
//         <Grid container spacing={3}>
//           <Grid item xs={12} sm={6} md={4}><MetricCard title="Success Rate" value={`${metrics.upgradeSuccessRate.toFixed(1)}%`} icon={<CheckCircleOutlineIcon />} /></Grid>
//           <Grid item xs={12} sm={6} md={4}><MetricCard title="Avg Time to Upgrade" value={`${metrics.avgTimeToUpgradeMins.toFixed(1)} mins`} icon={<TimerIcon />} /></Grid>
//           <Grid item xs={12} sm={6} md={4}><MetricCard title="Build Time Improvement" value={`${Math.abs(metrics.buildTimeImprovementPercent)}% faster`} icon={<TrendingUpIcon />} /></Grid>
//           <Grid item xs={12} sm={6} md={4}><MetricCard title="Total Time Saved" value={`${metrics.timeSavedHrs} hours`} icon={<HourglassEmptyIcon />} /></Grid>
//           <Grid item xs={12} sm={6} md={4}><MetricCard title="Upgrades Initiated" value={metrics.upgradesInitiated} icon={<CheckCircleOutlineIcon />} /></Grid>
//           <Grid item xs={12} sm={6} md={4}><MetricCard title="Upgrades Completed" value={metrics.upgradesCompleted} icon={<CheckCircleOutlineIcon />} /></Grid>
//         </Grid>
//       </Paper>

//       {/* --- User Feedback Metrics Section --- */}
//       <Paper elevation={3} className={classes.section}>
//         <Typography variant="h5" gutterBottom>User Feedback (Averages)</Typography>
//         <Grid container spacing={3}>
//           <Grid item xs={12} sm={6} md={4}><MetricCard title="Upgrade Ease Score" value={`${metrics.avgEaseScore}/5`} icon={<StarBorderIcon />} /></Grid>
//           <Grid item xs={12} sm={6} md={4}><MetricCard title="Docs Helpfulness" value={`${metrics.avgDocsHelpfulness}/5`} icon={<LiveHelpIcon />} /></Grid>
//         </Grid>
//       </Paper>

//       {/* --- Qualitative Feedback Section --- */}
//       <Paper elevation={3} className={classes.section}>
//         <Typography variant="h5" gutterBottom>Qualitative Feedback</Typography>
//         <Grid container spacing={3}>
//           <Grid item xs={12} md={6}>
//             <InfoCard title="Improvement Suggestions">
//               <List>
//                 {metrics.improvementSuggestions.map((s, i) => (
//                   <ListItem key={i}>
//                     <ListItemIcon><WbIncandescentIcon color="primary" /></ListItemIcon>
//                     <ListItemText primary={s} />
//                   </ListItem>
//                 ))}
//               </List>
//             </InfoCard>
//           </Grid>
//           <Grid item xs={12} md={6}>
//             <InfoCard title="Reported Bugs">
//               <List>
//                 {metrics.reportedBugs.map((b, i) => (
//                   <ListItem key={i}>
//                     <ListItemIcon><BugReportIcon color="error" /></ListItemIcon>
//                     <ListItemText primary={b} />
//                   </ListItem>
//                 ))}
//               </List>
//             </InfoCard>
//           </Grid>
//         </Grid>
//       </Paper>
//     </div>
//   );
// };

import React, { useEffect, useState } from 'react';
import { Typography, Grid, List, ListItem, ListItemText, Paper, Box, ListItemIcon } from '@material-ui/core';
import { InfoCard, Progress } from '@backstage/core-components';
import { Alert } from '@material-ui/lab';
import { makeStyles, Theme } from '@material-ui/core/styles';

// Import all the icons we will need for the new cards
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import SystemUpdateAlt from '@material-ui/icons/SystemUpdateAlt';
import Launch from '@material-ui/icons/Launch';
import TimerIcon from '@material-ui/icons/Timer';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck';
import SecurityIcon from '@material-ui/icons/Security';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import LiveHelpIcon from '@material-ui/icons/LiveHelp';
import WbIncandescentIcon from '@material-ui/icons/WbIncandescent';
import BugReportIcon from '@material-ui/icons/BugReport';

// This type definition is correct and matches the backend.
interface UpgradeMetrics {
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
  timeSavedHrs: number; // Stays in the type, even if not displayed
  improvementSuggestions: string[];
  reportedBugs: string[];
}

// Styling hook is unchanged and correct.
const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.default,
  },
  section: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(3),
    borderRadius: '16px',
    backgroundColor: theme.palette.background.paper,
  },
  metricCard: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  },
  metricValue: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: theme.palette.primary.main,
  },
  icon: {
    fontSize: '3rem',
    color: theme.palette.primary.light,
    opacity: 0.8,
  },
}));

// Reusable MetricCard component is unchanged and correct.
const MetricCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => {
  const classes = useStyles();
  return (
    <InfoCard title={title} className={classes.metricCard}>
      <Grid container alignItems="center" justifyContent="space-between">
        <Grid item>
          <Typography variant="h4" className={classes.metricValue}>
            {value}
          </Typography>
        </Grid>
        <Grid item>
          <Box className={classes.icon}>{icon}</Box>
        </Grid>
      </Grid>
    </InfoCard>
  );
};

export const MetricsDashboardComponent = () => {
  const classes = useStyles();
  const [metrics, setMetrics] = useState<UpgradeMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch('http://localhost:7007/api/version-scanner/upgrade-metrics')
      .then(res => res.json())
      .then(json => setMetrics(json.metrics))
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Progress />;
  if (error) return <Alert severity="error">Could not load metrics: {error.message}</Alert>;
  if (!metrics) return <Alert severity="warning">No metrics data was found.</Alert>;

  return (
    <div className={classes.root}>
      {/* --- Operational Metrics Section --- */}
      <Paper elevation={3} className={classes.section}>
        <Typography variant="h5" gutterBottom>Operational Metrics</Typography>
        
        {/* ---> THE FIX IS HERE <--- */}
        {/* All the missing metric cards have been added, and Time Saved has been removed. */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}><MetricCard title="Upgrades Initiated" value={metrics.upgradesInitiated} icon={<SystemUpdateAlt />} /></Grid>
          <Grid item xs={12} sm={6} md={4}><MetricCard title="Upgrades Completed" value={metrics.upgradesCompleted} icon={<CheckCircleOutlineIcon />} /></Grid>
          <Grid item xs={12} sm={6} md={4}><MetricCard title="Success Rate" value={`${metrics.upgradeSuccessRate.toFixed(1)}%`} icon={<CheckCircleOutlineIcon />} /></Grid>
          <Grid item xs={12} sm={6} md={4}><MetricCard title="Avg Time to Upgrade" value={`${metrics.avgTimeToUpgradeMins.toFixed(1)} hours`} icon={<TimerIcon />} /></Grid>
          <Grid item xs={12} sm={6} md={4}><MetricCard title="Build Time Improvement" value={`${Math.abs(metrics.buildTimeImprovementPercent)}% faster`} icon={<TrendingUpIcon />} /></Grid>
          <Grid item xs={12} sm={6} md={4}><MetricCard title="Files Updated (Total)" value={metrics.filesUpdated} icon={<InsertDriveFileIcon />} /></Grid>
          <Grid item xs={12} sm={6} md={4}><MetricCard title="Unit Tests Generated" value={metrics.unitTestsGenerated} icon={<PlaylistAddCheckIcon />} /></Grid>
          <Grid item xs={12} sm={6} md={4}><MetricCard title="CVEs Fixed" value={metrics.cvesFixed} icon={<SecurityIcon />} /></Grid>
          <Grid item xs={12} sm={6} md={4}><MetricCard title="Pre-Upgrade Test Pass" value={`${metrics.preUpgradeTestPassRate.toFixed(1)}%`} icon={<CheckCircleOutlineIcon />} /></Grid>
          <Grid item xs={12} sm={6} md={4}><MetricCard title="Post-Upgrade Test Pass" value={`${metrics.postUpgradeTestPassRate.toFixed(1)}%`} icon={<CheckCircleOutlineIcon />} /></Grid>
        </Grid>
      </Paper>

      {/* --- User Feedback Metrics Section (Unchanged) --- */}
      <Paper elevation={3} className={classes.section}>
        <Typography variant="h5" gutterBottom>User Feedback (Averages)</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}><MetricCard title="Upgrade Ease Score" value={`${metrics.avgEaseScore}/5`} icon={<StarBorderIcon />} /></Grid>
          <Grid item xs={12} sm={6} md={4}><MetricCard title="Docs Helpfulness" value={`${metrics.avgDocsHelpfulness}/5`} icon={<LiveHelpIcon />} /></Grid>
          <Grid item xs={12} sm={6} md={4}><MetricCard title="Avg Time Saved" value={`${metrics.timeSavedHrs.toFixed(1)} hours`} icon={<TimerIcon />} /></Grid>
        </Grid>
      </Paper>

      {/* --- Qualitative Feedback Section (Unchanged) --- */}
      <Paper elevation={3} className={classes.section}>
        <Typography variant="h5" gutterBottom>Qualitative Feedback</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <InfoCard title="Improvement Suggestions">
              <List>{metrics.improvementSuggestions.map((s, i) => <ListItem key={i}><ListItemIcon><WbIncandescentIcon color="primary" /></ListItemIcon><ListItemText primary={s} /></ListItem>)}</List>
            </InfoCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <InfoCard title="Reported Bugs">
              <List>{metrics.reportedBugs.map((b, i) => <ListItem key={i}><ListItemIcon><BugReportIcon color="error" /></ListItemIcon><ListItemText primary={b} /></ListItem>)}</List>
            </InfoCard>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
};