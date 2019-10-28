import React, { useContext, useEffect, useState } from 'react';
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
  const [risk, setRisk] = useState();
  const [time, setTime] = useState();

  useEffect(() => {
    setRisk(preferences.risk);
    setTime(preferences.timeframe.timeframe);
  }, [preferences]);

  return (
    <div className={classes.root}>
      {
        risk && time
          ? (
            <React.Fragment>
              <Typography variant='h4'> Viewing portfolios for your preferred {
                  time === 0
                  ? 'Short Term'
                    : time === 1
                    ? 'Medium Term'
                    : time === 2
                      ? 'Long Term'
                      : null
              } {' '} {
risk === 0
                  ? 'Conservative'
: risk === 1
                    ? 'Balanced'
: risk === 2
                      ? 'Aggressive'
                      : null
              } strategy: </Typography>
            </React.Fragment>
          ) : (
            <Typography variant='h2'>Preferences not set.</Typography>
          )
      }
    </div>
  )
}
