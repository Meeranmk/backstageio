// import { useEffect, useState, useMemo } from 'react';
// import { Typography, Grid, Link as MuiLink } from '@material-ui/core';
// import { Table, InfoCard, Progress } from '@backstage/core-components';
// import { Alert } from '@material-ui/lab';

// // The new generic data type from the backend
// type ProjectAnalysisDetail = {
//   repository: string;
//   repositoryUrl: string;
//   projectType: string;
//   bestPracticesScore: number;
//   details: Record<string, string | number | null>;
// };

// const renderDetail = (detail: string | number | null | undefined) => {
//   return detail ? detail : <Typography color="textSecondary">-</Typography>;
// };

// export const ProjectAnalysisPage = () => {
//   const [data, setData] = useState<ProjectAnalysisDetail[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<Error | null>(null);

//   useEffect(() => {
//     // Fetch from the new generic endpoint
//     fetch('http://localhost:7007/api/version-scanner/project-analysis')
//       .then(res => res.json())
//       .then(json => {
//         if (json && Array.isArray(json.results)) {
//           setData(json.results);
//         }
//         setLoading(false);
//       })
//       .catch(err => {
//         setError(err);
//         setLoading(false);
//       });
//   }, []);

//   // ---> DYNAMIC COLUMN GENERATION <---
//   // useMemo ensures this logic only runs when the data changes.
//   const columns = useMemo(() => {
//     if (data.length === 0) return [];

//     // Find all unique detail keys across all projects (e.g., "Java Version", "Plugin Count")
//     const detailKeys = new Set<string>();
//     data.forEach(item => {
//       Object.keys(item.details).forEach(key => detailKeys.add(key));
//     });

//     // Create static columns that are always present
//     const staticColumns = [
//       { title: 'Repository', field: 'repository',
//         render: (rowData: ProjectAnalysisDetail) => (
//           <MuiLink href={rowData.repositoryUrl} target="_blank" rel="noopener noreferrer">
//             <b>{rowData.repository}</b>
//           </MuiLink>
//         ),
//       },
//       { title: 'Project Type', field: 'projectType' },
//       { title: 'Score', field: 'bestPracticesScore', type: 'numeric' as const },
//     ];
    
//     // Create a dynamic column for each unique detail key
//     const dynamicColumns = Array.from(detailKeys).map(key => ({
//       title: key,
//       // We access the nested 'details' object to get the value
//       render: (rowData: ProjectAnalysisDetail) => renderDetail(rowData.details[key]),
//     }));

//     return [...staticColumns, ...dynamicColumns];
//   }, [data]);

//   if (loading) return <Progress />;
//   if (error) return <Alert severity="error">Error fetching data: {error?.message}</Alert>;
//   if (data.length === 0) {
//     return (
//       <InfoCard title="No Analyzable Projects Found">
//         <Typography variant="body1">
//           The scanner did not find any repositories with a `build.gradle` or `pom.xml` file.
//         </Typography>
//       </InfoCard>
//     );
//   }

//   // Create a simple summary card
//   const projectTypeSummary = data.reduce((acc, cur) => {
//     acc[cur.projectType] = (acc[cur.projectType] || 0) + 1;
//     return acc;
//   }, {} as Record<string, number>);

//   return (
//     <>
//       <Grid container spacing={3} style={{ marginBottom: '24px' }}>
//         <Grid item xs={12} md={6}>
//           <InfoCard title="Project Types Found">
//             {Object.entries(projectTypeSummary).map(([type, count]) => (
//               <Typography key={type}>{`${type.toUpperCase()}: ${count} projects`}</Typography>
//             ))}
//           </InfoCard>
//         </Grid>
//       </Grid>
      
//       <Table
//         title="Project Analysis Details"
//         options={{ paging: true, search: true }}
//         columns={columns}
//         data={data}
//       />
//     </>
//   );
// };

import React, { useEffect, useState, useMemo } from 'react';
import { Typography, Grid, Link as MuiLink, List, ListItem, ListItemText, Paper, Chip } from '@material-ui/core';
import { Table, InfoCard, Progress } from '@backstage/core-components';
import { Alert } from '@material-ui/lab';

// Type definitions to match the backend response
type ProjectAnalysisDetail = {
  repository: string;
  repositoryUrl: string;
  projectType: string;
  bestPracticesScore: number;
  details: Record<string, string | number | null>;
};

type AnalysisSummary = {
  javaVersionCounts: Record<string, number>;
  springBootVersionCounts: Record<string, number>;
  bestProject: ProjectAnalysisDetail | null;
  worstProject: ProjectAnalysisDetail | null;
};

// This is the shape of the entire API response object
type AnalysisResponse = {
  details: ProjectAnalysisDetail[];
  summary: AnalysisSummary;
};

const renderDetail = (detail: string | number | null | undefined) => {
  return detail ? detail : <Typography color="textSecondary">-</Typography>;
};

export const ProjectAnalysisPage = () => {
  // The state will hold the nested 'details' and 'summary' object, or null
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch('http://localhost:7007/api/version-scanner/project-analysis')
      .then(res => res.json())
      .then(json => {
        // ---> FIX 1: We set the state to json.results, not json itself <---
        if (json && json.results) {
          setData(json.results); 
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  const columns = useMemo(() => {
    // ---> FIX 2: We access data.details now that 'data' is the correct object <---
    if (!data || data.details.length === 0) return [];

    const detailKeys = new Set<string>();
    data.details.forEach(item => {
      Object.keys(item.details).forEach(key => detailKeys.add(key));
    });

    const staticColumns = [
      { title: 'Repository', field: 'repository',
        render: (rowData: ProjectAnalysisDetail) => (
          <MuiLink href={rowData.repositoryUrl} target="_blank" rel="noopener noreferrer">
            <b>{rowData.repository}</b>
          </MuiLink>
        ),
      },
      { title: 'Project Type', field: 'projectType' },
      { title: 'Score', field: 'bestPracticesScore', type: 'numeric' as const },
    ];
    
    const dynamicColumns = Array.from(detailKeys).map(key => ({
      title: key,
      render: (rowData: ProjectAnalysisDetail) => renderDetail(rowData.details[key]),
    }));

    return [...staticColumns, ...dynamicColumns];
  }, [data]);

  if (loading) return <Progress />;
  if (error) return <Alert severity="error">Error fetching data: {error?.message}</Alert>;
  
  // ---> FIX 3: This check now correctly looks at data.details <---
  if (!data || data.details.length === 0) {
    return (
      <InfoCard title="No Analyzable Projects Found">
        <Typography variant="body1">
          The scanner did not find any repositories with a `build.gradle` or `pom.xml` file.
        </Typography>
      </InfoCard>
    );
  }

  const { details, summary } = data;

  return (
    <>
      <Grid container spacing={3} style={{ marginBottom: '24px' }}>
        <Grid item xs={12} md={6}>
          <InfoCard title="Java Versions">
            <List dense>
              {Object.entries(summary.javaVersionCounts).map(([version, count]) => (
                <ListItem key={version}><ListItemText primary={`${version}: ${count} files`} /></ListItem>
              ))}
            </List>
          </InfoCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <InfoCard title="Spring Boot Versions">
            <List dense>
              {Object.entries(summary.springBootVersionCounts).map(([version, count]) => (
                <ListItem key={version}><ListItemText primary={`${version}: ${count} files`} /></ListItem>
              ))}
            </List>
          </InfoCard>
        </Grid>
      </Grid>
      
      <Grid container spacing={3} style={{ marginBottom: '24px' }}>
        <Grid item xs={12} md={6}>
          <Paper style={{ padding: '16px', backgroundColor: '#388e3c', color: 'white' }}>
            <Typography variant="h6">
              Best: {summary.bestProject ? `${summary.bestProject.repository} (${summary.bestProject.bestPracticesScore})` : 'N/A'}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper style={{ padding: '16px', backgroundColor: '#d32f2f', color: 'white' }}>
            <Typography variant="h6">
              Needs Improvement: {summary.worstProject ? `${summary.worstProject.repository} (${summary.worstProject.bestPracticesScore})` : 'N/A'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      <Table
        title="Project Analysis Details"
        options={{ paging: true, search: true }}
        columns={columns}
        data={details}
      />

      <Chip label="Results analysis complete!" color="primary" style={{ marginTop: '24px', backgroundColor: '#388e3c' }} />
    </>
  );
};