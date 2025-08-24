import React from 'react';
import { Page, Content, Header } from '@backstage/core-components';
import { useApi, configApiRef } from '@backstage/core-plugin-api';
 
// Custom MS Forms component that embeds the form directly
const MSFormsEmbed = ({ formUrl }: { formUrl: string }) => {
  return (
    <div style={{ width: '100%', height: '800px' }}>
      <iframe
        src={formUrl}
        width="100%"
        height="100%"
        frameBorder="0"
        marginHeight={0}
        marginWidth={0}
        title="Feedback Form"
        style={{
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        Loading feedback form...
      </iframe>
    </div>
  );
};
 
export const FeedbackFormComponent = () => {
//   const config = useApi(configApiRef);
 
  try {
    // const formUrl = config.getString('feedback.formUrl');
    const formUrl = "https://forms.office.com/Pages/ResponsePage.aspx?id=uOVduNM_IEuTKA0mjbEoL6dXHXFH-MJOtXXbXh4OPMdUMjNMTDhCVkpGMVpDTDRFNlpRRVFQUTBJQy4u"
    // const formUrl = config.getString('feedback.formUrl');
    return (
      <Page themeId="tool">
        {/* <Header
          title="Feedback"
          subtitle="Share your thoughts and help us improve!"
        /> */}
        <Content>
          <MSFormsEmbed formUrl={formUrl} />
        </Content>
      </Page>
    );
  } catch (error) {
    return (
      <Page themeId="tool">
        {/* <Header title="Feedback" /> */}
        <Content>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h3>Feedback form configuration missing</h3>
            <p>Please add the feedback form URL to your app-config.yaml:</p>
            <pre style={{
              backgroundColor: '#f5f5f5',
              padding: '10px',
              borderRadius: '4px',
              textAlign: 'left',
              display: 'inline-block'
            }}>
{`feedback:
  formUrl: "https://forms.office.com/Pages/ResponsePage.aspx?id=..."`}
            </pre>
          </div>
        </Content>
      </Page>
    );
  }
};

// import React, { useState } from 'react';
// import { 
//   Typography, 
//   Grid, 
//   Button, 
//   TextField, 
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Radio,
//   RadioGroup,
//   FormControlLabel,
// } from '@material-ui/core';
// import { InfoCard, Progress } from '@backstage/core-components';
// import { Alert } from '@material-ui/lab';
// import { makeStyles, Theme } from '@material-ui/core/styles';

// const useStyles = makeStyles((theme: Theme) => ({
//   // This class will now be applied to a div *inside* the InfoCard
//   root: {
//     padding: theme.spacing(3),
//   },
//   introText: {
//     marginBottom: theme.spacing(3),
//     color: theme.palette.text.secondary,
//   },
//   sectionTitle: {
//     marginBottom: theme.spacing(2),
//     fontWeight: 'bold',
//   },
//   tableHeader: {
//     fontWeight: 'bold',
//     backgroundColor: theme.palette.background.default,
//   },
//   tableCell: {
//     textAlign: 'center',
//   },
//   firstColumn: {
//     textAlign: 'left',
//     fontWeight: 'bold',
//   },
//   submitButton: {
//     marginTop: theme.spacing(3),
//   },
// }));

// const ratingQuestions = [
//   { id: 'easeScore', label: 'Upgrade Ease Score' },
//   { id: 'promptHelpfulness', label: 'Copilot Prompt Helpfulness' },
//   { id: 'docsHelpfulness', label: 'Docs Helpfulness' },
//   { id: 'successRate', label: 'Upgrade Success Rate' },
//   { id: 'satisfaction', label: 'Overall Satisfaction' },
// ];

// const ratingLabels = ['Very Bad', 'Not Up to the Mark', 'Average', 'Good', 'Very Good'];

// export const FeedbackFormComponent = () => {
//   const classes = useStyles();
  
//   const [formState, setFormState] = useState({
//     easeScore: 0,
//     promptHelpfulness: 0,
//     docsHelpfulness: 0,
//     successRate: 0,
//     satisfaction: 0,
//     suggestions: '',
//   });

//   const [status, setStatus] = useState<'editing' | 'submitting' | 'submitted' | 'error'>('editing');

//   const handleRatingChange = (questionId: string, value: string) => {
//     setFormState(prevState => ({ ...prevState, [questionId]: parseInt(value, 10) }));
//   };

//   const handleSuggestionsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setFormState(prevState => ({ ...prevState, suggestions: event.target.value }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setStatus('submitting');
//     try {
//       const response = await fetch('/api/version-scanner/submit-feedback', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formState),
//       });
//       if (!response.ok) throw new Error('Failed to submit feedback');
//       setStatus('submitted');
//     } catch {
//       setStatus('error');
//     }
//   };

//   if (status === 'submitted') {
//     return <Alert severity="success">Thank you! Your feedback has been submitted successfully.</Alert>;
//   }

//   return (
//     // ---> THE FIX IS HERE <---
//     // The incorrect `contentClassName` prop is removed from the InfoCard.
//     <InfoCard title="Sample Test Form for Feedback">
//       {/* A new div is added inside to hold the content and apply the padding style. */}
//       <div className={classes.root}>
//         <Typography variant="body1" className={classes.introText}>
//           When you submit this form, it will not automatically collect your details like name and email address unless you provide it yourself.
//         </Typography>

//         <form onSubmit={handleSubmit}>
//           <Typography variant="h6" className={classes.sectionTitle}>
//             1. How was the repo upgradation process?
//           </Typography>
//           <TableContainer component={Paper} elevation={2}>
//             <Table>
//               <TableHead>
//                 <TableRow>
//                   <TableCell className={classes.tableHeader}></TableCell>
//                   {ratingLabels.map(label => (
//                     <TableCell key={label} className={`${classes.tableHeader} ${classes.tableCell}`}>{label}</TableCell>
//                   ))}
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {ratingQuestions.map(q => (
//                   <TableRow key={q.id}>
//                     <TableCell component="th" scope="row" className={classes.firstColumn}>
//                       {q.label}
//                     </TableCell>
//                     {/* The logic for the radio buttons was a bit complex, simplifying it */}
//                     {ratingLabels.map((_, index) => (
//                       <TableCell key={index} className={classes.tableCell} padding="none">
//                         <Radio
//                           checked={formState[q.id as keyof typeof formState] === index + 1}
//                           onChange={e => handleRatingChange(q.id, e.target.value)}
//                           value={index + 1}
//                           name={q.id}
//                         />
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </TableContainer>

//           <Typography variant="h6" className={classes.sectionTitle} style={{ marginTop: '24px' }}>
//             2. Improvement Suggestions and Upgrade Issues
//           </Typography>
//           <TextField
//             placeholder="Enter your answer"
//             multiline
//             rows={4}
//             fullWidth
//             variant="outlined"
//             value={formState.suggestions}
//             onChange={handleSuggestionsChange}
//           />

//           <Button 
//             type="submit" 
//             variant="contained" 
//             color="primary" 
//             className={classes.submitButton}
//             disabled={status === 'submitting'}
//           >
//             {status === 'submitting' ? <Progress /> : 'Submit'}
//           </Button>

//           {status === 'error' && (
//             <Alert severity="error" style={{ marginTop: '16px' }}>
//               Could not submit feedback. Please try again later.
//             </Alert>
//           )}
//         </form>
//       </div>
//     </InfoCard>
//   );
// };