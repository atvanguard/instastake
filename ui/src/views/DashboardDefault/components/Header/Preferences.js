import React, { useContext } from 'react';
import {  Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

import { AppContext } from 'contexts/AppContext';

const useStyles = makeStyles(() => ({
  root: {
    height: '100%',
    width: '100%',
    display: 'flex column',
    overflow: 'hidden',
    padding: 10
  }
}));

export const Preferences = () => {
  const classes = useStyles();
  const { preferences } = useContext(AppContext);
  
  console.log('preferences -< ', preferences);
  return (
    <div className={classes.root}>
      {
        preferences
          ? (
            <React.Fragment>
              <Typography variant='h3'>My Preferences: </Typography>
              <Typography variant='p'>Risk: {} </Typography>
              <Typography variant='p'>Timeframe: {} </Typography>
            </React.Fragment>
          ) : (
            <Typography variant='h2'>Preferences not set.</Typography>
          )
      }
    </div>
  )
}