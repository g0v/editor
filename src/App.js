import React, { useState, useEffect } from 'react';
import { OAuth } from 'oauthio-web';
import queryString from 'query-string';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

import { oauthKey } from './config';
import Github from './utils/github';

import Form from './components/Form';

OAuth.initialize(oauthKey);

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#05D4A6',
      dark: '#05D4A6',
      contrastText: '#fff',
    },
  },
});

const useStyles = makeStyles((theme) => ({
  header: {
    width: '100%',
    textAlign: 'center',
    backgroundColor: '#F4F4F4',
    paddingTop: 50,
    paddingBottom: 50,
  },
  headerTitle: {
    fontFamily: 'Helvetica',
    fontSize: 24,
    color: '#000000',
  },
  headerContent: {
    margin: '0 auto',
    width: 400,
  },
  container: {
    padding: theme.spacing(2),
    width: 500,
    margin: '0 auto',
  },
}));

function App() {
  const classes = useStyles();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [github, setGithub] = useState(null);
  const [showHeader, setShowHeader] = useState(true);

  const githubLogin = (e) => {
    setIsSubmitting(true);
    OAuth.popup('github')
      .done((connection) => {
        return connection.get('/user')
          .done((user) => {
            setIsSubmitting(false);
            setGithub(new Github(connection, user.login));
          });
      })
      .fail(console.error);
  };

  useEffect(() => {
    const { hideHeader, autoLogin } = queryString.parse(window.location.search);
    if (hideHeader) {
      setShowHeader(false);
    }
    if (autoLogin) {
      githubLogin();
    }
  }, []);

  return (
    <MuiThemeProvider theme={theme}>
      {showHeader &&
        <div className={classes.header}>
          <img src="logo.png"/>
          <h1 className={classes.headerTitle}>g0v metadata editor</h1>
          <p className={classes.headerContent}>
            The form below will help you build a valid g0v.json file.
            Fill out all of the required fields (marked by a star) and any others.
            Next, you can click the buttons at the bottom of the page to render and create a Pull Request to target repository.
          </p>
        </div>}
      <Grid container justify="center" className={classes.container}>
        {!github &&
          <Button
            color="primary"
            variant="contained"
            onClick={githubLogin}
            style={{ fontWeight: 'bold' }}
            disabled={isSubmitting}
            disableElevation={true}
          >
            用 github 登入以建立 Pull Request
          </Button>}
        {github && <Form github={github}/>}
      </Grid>
    </MuiThemeProvider>);
}

export default App;
