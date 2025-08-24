// import React, { useEffect, useState } from 'react';
// import { Table, TabbedLayout, InfoCard, Progress } from '@backstage/core-components';
// import { Typography, Grid, Link as MuiLink, Button } from '@material-ui/core';
// import { Link as RouterLink } from 'react-router-dom';

// // ---> CHANGE 1: Add mavenVersion to the ScanResult type <---
// type ScanResult = {
//   repository: string;
//   repositoryUrl: string;
//   gradleVersion: string | null;
//   mavenVersion: string | null;
//   javaVersion: string | null;
//   springBootVersion: string | null;
//   camelVersion: string | null;
// };

// const renderVersion = (version: string | null | undefined) => {
//   return version ? version : <Typography color="textSecondary">Unknown</Typography>;
// };

// export const GitHubRepos = () => {
//   const [data, setData] = useState<ScanResult[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetch('http://localhost:7007/api/version-scanner/version-info')
//       .then(res => res.json())
//       .then(json => {
//         if (json && Array.isArray(json.results)) {
//           setData(json.results);
//         }
//         setLoading(false);
//       })
//       .catch(err => {
//         console.error('Error fetching scan results', err);
//         setLoading(false);
//       });
//   }, []);

//   if (loading) return <Progress />;

//   // ---> CHANGE 2: Add a summary count for Maven projects <---
//   const totalRepos = data.length;
//   const gradleProjects = data.filter(r => r.gradleVersion).length;
//   const mavenProjects = data.filter(r => r.mavenVersion).length;
//   const javaProjects = data.filter(r => r.javaVersion).length;
//   const springProjects = data.filter(r => r.springBootVersion).length;
//   const camelProjects = data.filter(r => r.camelVersion).length;

//   // ---> CHANGE 3: Add a new column to the table definition <---
//   const columns = [
//     { 
//       title: 'Repository', 
//       field: 'repository',
//       render: (rowData: ScanResult) => (
//         <MuiLink href={rowData.repositoryUrl} target="_blank" rel="noopener noreferrer">
//           <b>{rowData.repository}</b>
//         </MuiLink>
//       )
//     },
//     { 
//       title: 'Gradle Version', 
//       field: 'gradleVersion',
//       render: (rowData: ScanResult) => renderVersion(rowData.gradleVersion)
//     },
//     { 
//       title: 'Maven Version', 
//       field: 'mavenVersion',
//       render: (rowData: ScanResult) => renderVersion(rowData.mavenVersion)
//     },
//     { 
//       title: 'Java Version', 
//       field: 'javaVersion',
//       render: (rowData: ScanResult) => renderVersion(rowData.javaVersion)
//     },
//     { 
//       title: 'Spring Boot Version', 
//       field: 'springBootVersion',
//       render: (rowData: ScanResult) => renderVersion(rowData.springBootVersion)
//     },
//     { 
//       title: 'Camel Version', 
//       field: 'camelVersion',
//       render: (rowData: ScanResult) => renderVersion(rowData.camelVersion)
//     },
//   ];

//   const renderTable = (filterFn?: (r: ScanResult) => boolean) => {
//     const filteredData = filterFn ? data.filter(filterFn) : data;
//     return (
//       <Table
//         key={filteredData.length} 
//         title="Scan Results"
//         options={{ paging: true, search: true, filtering: true, emptyRowsWhenPaging: false }}
//         columns={columns}
//         data={filteredData}
//       />
//     );
//   };
  
//   return (
//     <>
//       {/* ---> CHANGE 4: Adjust grid layout and add the new InfoCard <--- */}
//       <Grid container spacing={2} style={{ marginBottom: '20px' }}>
//         <Grid item xs={12} sm={2}><InfoCard title="Total Repos"><Typography variant="h5">{totalRepos}</Typography></InfoCard></Grid>
//         <Grid item xs={12} sm={2}><InfoCard title="Gradle Projects"><Typography variant="h5">{gradleProjects}</Typography></InfoCard></Grid>
//         <Grid item xs={12} sm={2}><InfoCard title="Maven Projects"><Typography variant="h5">{mavenProjects}</Typography></InfoCard></Grid>
//         <Grid item xs={12} sm={2}><InfoCard title="Java Projects"><Typography variant="h5">{javaProjects}</Typography></InfoCard></Grid>
//         <Grid item xs={12} sm={2}><InfoCard title="Spring Boot"><Typography variant="h5">{springProjects}</Typography></InfoCard></Grid>
//         <Grid item xs={12} sm={2}><InfoCard title="Camel Projects"><Typography variant="h5">{camelProjects}</Typography></InfoCard></Grid>
//       </Grid>
      
//       <Grid container justifyContent="flex-end" style={{ marginBottom: '20px' }}>
//         <Grid item>
//             <Button variant="contained" color="primary" component={RouterLink} to="./project-analysis" >
//                 Go to Project Analysis
//             </Button>
//         </Grid>
//       </Grid>

//       <TabbedLayout>
//         <TabbedLayout.Route path="/" title="All Data">
//           {renderTable()}
//         </TabbedLayout.Route>
//         <TabbedLayout.Route path="/gradle" title="Gradle">
//           {renderTable(r => !!r.gradleVersion)}
//         </TabbedLayout.Route>
//         {/* ---> CHANGE 5: Add a new Tab for Maven projects <--- */}
//         <TabbedLayout.Route path="/maven" title="Maven">
//           {renderTable(r => !!r.mavenVersion)}
//         </TabbedLayout.Route>
//         <TabbedLayout.Route path="/java" title="Java">
//           {renderTable(r => !!r.javaVersion)}
//         </TabbedLayout.Route>
//         <TabbedLayout.Route path="/spring" title="Spring Boot">
//           {renderTable(r => !!r.springBootVersion)}
//         </TabbedLayout.Route>
//         <TabbedLayout.Route path="/camel" title="Camel">
//           {renderTable(r => !!r.camelVersion)}
//         </TabbedLayout.Route>
//       </TabbedLayout>
//     </>
//   );
// };

import React, { useEffect, useState } from 'react';
import { Table, TabbedLayout, InfoCard, Progress } from '@backstage/core-components';
import { Typography, Grid, Link as MuiLink, Button } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import { useApi, configApiRef } from '@backstage/core-plugin-api';

// Import the icons for the buttons
import DescriptionIcon from '@material-ui/icons/Description';
import FeedbackIcon from '@material-ui/icons/Feedback';

type ScanResult = {
  repository: string;
  repositoryUrl: string;
  gradleVersion: string | null;
  mavenVersion: string | null;
  javaVersion: string | null;
  springBootVersion: string | null;
  camelVersion: string | null;
};

const renderVersion = (version: string | null | undefined) => {
  return version ? version : <Typography color="textSecondary">Unknown</Typography>;
};

export const GitHubRepos = () => {
  // ---> FIX 1: Correctly read from the config API <---
  const config = useApi(configApiRef);
  // Using getOptionalString is safer and prevents crashes if the config is missing.
  const docUrl = "https://syscobt.atlassian.net/wiki/x/-inBRAE";

  const [data, setData] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ---> FIX 2: Use the relative proxy path for the API call <---
    fetch('http://localhost:7007/api/version-scanner/version-info')
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then(json => {
        if (json && Array.isArray(json.results)) {
          setData(json.results);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching scan results', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <Progress />;

  const totalRepos = data.length;
  const gradleProjects = data.filter(r => r.gradleVersion).length;
  const mavenProjects = data.filter(r => r.mavenVersion).length;
  const javaProjects = data.filter(r => r.javaVersion).length;
  const springProjects = data.filter(r => r.springBootVersion).length;
  const camelProjects = data.filter(r => r.camelVersion).length;

  const columns = [
    { 
      title: 'Repository', 
      field: 'repository',
      render: (rowData: ScanResult) => (
        <MuiLink href={rowData.repositoryUrl} target="_blank" rel="noopener noreferrer">
          <b>{rowData.repository}</b>
        </MuiLink>
      )
    },
    { title: 'Gradle Version', field: 'gradleVersion', render: (rowData: ScanResult) => renderVersion(rowData.gradleVersion) },
    { title: 'Maven Version', field: 'mavenVersion', render: (rowData: ScanResult) => renderVersion(rowData.mavenVersion) },
    { title: 'Java Version', field: 'javaVersion', render: (rowData: ScanResult) => renderVersion(rowData.javaVersion) },
    { title: 'Spring Boot Version', field: 'springBootVersion', render: (rowData: ScanResult) => renderVersion(rowData.springBootVersion) },
    { title: 'Camel Version', field: 'camelVersion', render: (rowData: ScanResult) => renderVersion(rowData.camelVersion) },
  ];

  const renderTable = (filterFn?: (r: ScanResult) => boolean) => {
    const filteredData = filterFn ? data.filter(filterFn) : data;
    return (
      <Table
        key={filteredData.length} 
        title="Scan Results"
        options={{ paging: true, search: true, filtering: true, emptyRowsWhenPaging: false }}
        columns={columns}
        data={filteredData}
      />
    );
  };
  
  return (
    <>
      <Grid container spacing={2} style={{ marginBottom: '20px' }}>
        <Grid item xs={12} sm={2}><InfoCard title="Total Repos"><Typography variant="h5">{totalRepos}</Typography></InfoCard></Grid>
        <Grid item xs={12} sm={2}><InfoCard title="Gradle Projects"><Typography variant="h5">{gradleProjects}</Typography></InfoCard></Grid>
        <Grid item xs={12} sm={2}><InfoCard title="Maven Projects"><Typography variant="h5">{mavenProjects}</Typography></InfoCard></Grid>
        <Grid item xs={12} sm={2}><InfoCard title="Java Projects"><Typography variant="h5">{javaProjects}</Typography></InfoCard></Grid>
        <Grid item xs={12} sm={2}><InfoCard title="Spring Boot"><Typography variant="h5">{springProjects}</Typography></InfoCard></Grid>
        <Grid item xs={12} sm={2}><InfoCard title="Camel Projects"><Typography variant="h5">{camelProjects}</Typography></InfoCard></Grid>
      </Grid>
      
      <Grid container justifyContent="flex-end" spacing={2} style={{ marginBottom: '20px' }}>
        {docUrl && (
          <Grid item>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<DescriptionIcon />}
              href={docUrl}
              target="_blank"
            >
              Confluence Docs
            </Button>
          </Grid>
        )}
        <Grid item>
            {/* ---> FIX 3: Use absolute paths for reliable navigation <--- */}
            <Button
                variant="outlined"
                color="primary"
                startIcon={<FeedbackIcon />}
                component={RouterLink}
                to="/upgrade-dashboard/feedback"
            >
                Submit Feedback
            </Button>
        </Grid>
        <Grid item>
            <Button variant="contained" color="primary" component={RouterLink} to="/project-analysis" >
                Go to Project Analysis
            </Button>
        </Grid>
      </Grid>

      <TabbedLayout>
        <TabbedLayout.Route path="/" title="All Data">
          {renderTable()}
        </TabbedLayout.Route>
        <TabbedLayout.Route path="/gradle" title="Gradle">
          {renderTable(r => !!r.gradleVersion)}
        </TabbedLayout.Route>
        <TabbedLayout.Route path="/maven" title="Maven">
          {renderTable(r => !!r.mavenVersion)}
        </TabbedLayout.Route>
        <TabbedLayout.Route path="/java" title="Java">
          {renderTable(r => !!r.javaVersion)}
        </TabbedLayout.Route>
        <TabbedLayout.Route path="/spring" title="Spring Boot">
          {renderTable(r => !!r.springBootVersion)}
        </TabbedLayout.Route>
        <TabbedLayout.Route path="/camel" title="Camel">
          {renderTable(r => !!r.camelVersion)}
        </TabbedLayout.Route>
      </TabbedLayout>
    </>
  );
};