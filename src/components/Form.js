import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import G0vJSON from 'g0v.json';
import queryString from 'query-string';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { Form } from 'react-final-form';
import { TextField, Autocomplete } from 'mui-rff';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  inputContainer: {
    marginBottom: theme.spacing(2),
  },
  formContainer: {
    width: '100%',
  },
}));

const schema = new G0vJSON('v1').schema().properties;

const formFields = Object.keys(schema).map((key, index) => {
  const item = schema[key];
  if (item.enum) {
    return (
      <Autocomplete
        key={index}
        name={key}
        label={item.title}
        options={item.enum.map((x) => ({ label: x, value: x }))}
        getOptionValue={(option) => option.value}
        getOptionLabel={(option) => option.label}
        disableCloseOnSelect={false}
        renderInput={(params) =><TextField {...params} label={item.title} placeholder={item.description} variant="outlined" />}
      />);
  }

  return (
    <TextField
      key={index}
      name={key}
      label={item.title}
      variant={'outlined'}
      placeholder={item.description}
      required={item.required}
    />
  );
});

function FormPage({ github }) {
  const classes = useStyles();
  const [initialValues, setInitialValues] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prUrl, setPrUrl] = useState(undefined);

  const onSubmit = async (values) => {
    setIsSubmitting(true);

    const branch = 'master';

    Object.keys(values).forEach((key)=>{
      if (schema[key].type === 'array') {
        values[key] = values[key].split(',').filter((x )=> x);
      }
    });

    const data = JSON.stringify(values, null, '  ');

    github.filename = 'g0v.json';
    [github.author, github.repo] = values.repo.split('/');

    await github.createFork();
    github.blob = await github.createBlob(data);
    const refs = await github.getReference(branch);
    github.commit = await github.getCommit(refs);
    const baseTree = await github.getTree(github.commit);
    const tree = await github.createTree(baseTree);
    const newCommit = await github.createCommit(tree);
    const newCommitRef = await github.createReference(newCommit);
    const pr = await github.createPullRequest(newCommitRef);
    setPrUrl(pr.html_url);
    setIsSubmitting(false);
  };

  const openPrUrl = ()=>{
    window.open(prUrl, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    (async () => {
      const queryParams = queryString.parse(window.location.search);

      let data = queryParams;
      const { repo } = queryParams;
      if (repo) {
        const url = `https://raw.githubusercontent.com/${repo}/master/g0v.json`;
        const res = await fetch(url);
        if (res.ok) {
          data = await res.json();
        }
      }

      Object.keys(data).forEach((key) => {
        if (!schema[key]) {
          delete data[key];
        } else
        if (schema[key].type === 'string') {
          data[key] = normalize(data[key]);
        } else
        if (schema[key].type === 'array') {
          if (Array.isArray(data[key])) {
            data[key] = data[key].map(normalize).join(',');
          } else {
            data[key] = normalize(data[key]);
          }
        }
      });

      if (repo) {
        data.repo = repo;
      }

      setInitialValues(data);
    })();
  }, []);

  return (<Form
    onSubmit={onSubmit}
    initialValues={initialValues}
    render={({ handleSubmit }) => (
      <form onSubmit={handleSubmit} noValidate className={classes.formContainer}>
        <Grid container direction="column" alignContent="stretch">
          {formFields.map((item, index) => (
            <Grid item className={classes.inputContainer} key={index}>
              {item}
            </Grid>
          ))}
        </Grid>
        <Grid container justify="center">
          {!prUrl ?
            <Button color="primary" variant="contained" type="submit" disabled={isSubmitting}>
              建立 Pull Request
            </Button>:
            <Button color="primary" variant="contained" onClick={openPrUrl}>
              前往 GitHub PR 頁面
            </Button>
          }
        </Grid>
      </form>
    )} />
  );
}

FormPage.propTypes = {
  github: PropTypes.object.isRequired,
};

export default FormPage;

function normalize(value) {
  if (typeof value === 'object') return JSON.stringify(value);

  return value;
}
