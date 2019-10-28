import React, { useState, useContext } from 'react';

import { Card, CardActionArea, CardContent, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import AlarmOutlined from '@material-ui/icons/AlarmOutlined';
import { AppContext } from 'contexts/AppContext';

const useStyles = makeStyles(() => ({
  root: {
    height: '100%',
    width: '100%',
    display: 'flex column',
    overflow: 'hidden',
    padding: 10
  },
  options: {
    display: 'flex',
    height: '100%',
    width: '100%',
    justifyContent: 'space-around',
    padding: 20,
    margin: 10
  },
  card: {
    width: 345,
  },
  cardContent: {
    display: 'flex column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center'
  },
  heading: {
    display: 'flex column',
    justifyContent: 'center',
    alignItems: 'center'
  }
}))

export const Onboarding =
(props) => {
  const { toggle } = props;
  const classes = useStyles();
  const [step, setStep] = useState(0);
  const { handleSetInvestorPreferences, preferences } = useContext(AppContext);

  const setTimePreferences = (timeframe) => {
    handleSetInvestorPreferences({
      ...preferences,
      timeframe
    });
    setStep(step + 1);
  }

  const setAllocationPreferences = (risk) => {
    handleSetInvestorPreferences({
      ...preferences,
      risk
    });

    setStep(-1);
    toggle();
  }

  return (
    <div className={classes.root}>
      <PickAllocation setPreferences={setAllocationPreferences} />
      {/* {
        step === 0
          ? <PickTimeFrame setPreferences={setTimePreferences} />
          : <PickAllocation setPreferences={setAllocationPreferences} />
      } */}
    </div>
  )
}

const PickTimeFrame = (props) => {
  const classes = useStyles();
  const { setPreferences } = props;

  return (
    <div className={classes.root}>
      <div className={classes.heading}>
        <h4> How long would you like to stay invested for? </h4>
        <p>Choose the time duration based on when you think you'll need to withdraw your investment</p>
      </div>

      <div className={classes.options}>
        <Card className={classes.card}>
          <CardActionArea onClick={() => setPreferences({ timeframe: 0 })}>
            <CardContent className={classes.cardContent}>
              <AlarmOutlined color='primary' fontSize='large' />

              <Typography variant='h4' component='h2'>Short Term</Typography>
              <p> (1 - 2 years) </p>
            </CardContent>
          </CardActionArea>
        </Card>

        <Card className={classes.card}>
          <CardActionArea onClick={() => setPreferences({ timeframe: 1 })}>
            <CardContent className={classes.cardContent}>
              <AlarmOutlined color='primary' fontSize='large' />
              <Typography variant='h4' component='h2'>Medium Term</Typography>
              <p>(3 - 5 years)</p>
            </CardContent>
          </CardActionArea>
        </Card>

        <Card className={classes.card}>
          <CardActionArea onClick={() => setPreferences({ timeframe: 2 })}>
            <CardContent className={classes.cardContent}>
              <AlarmOutlined color='primary' fontSize='large' />
              <Typography variant='h4' component='h2'>Long Term</Typography>
              <p>(5+ years)</p>
            </CardContent>
          </CardActionArea>
        </Card>
      </div>
    </div>
  )
}

const PickAllocation = (props) => {
  const classes = useStyles();
  const { setPreferences } = props;

  return (
    <div className={classes.root}>
      <Typography variant='h2'>Which strategy would you prefer for this investment?</Typography>

      <Typography variant='h4'>Aggressive strategy best suited to grow long-term savings. If you are here to park money for very short-time, then choose conservative.</Typography>

      <div className={classes.options}>
        <Card className={classes.card}>
          <CardActionArea onClick={() => setPreferences({ risk: 0 })}>
            <CardContent className={classes.cardContent}>
              <AlarmOutlined color='primary' fontSize='large' />
              <Typography variant='h4' component='h2'>Conservative</Typography>
              <p>(Steady returns with low volatility.)</p>
            </CardContent>
          </CardActionArea>
        </Card>

        <Card className={classes.card}>
          <CardActionArea onClick={() => setPreferences({ risk: 1 })}>
            <CardContent className={classes.cardContent}>
              <AlarmOutlined color='primary' fontSize='large' />
              <Typography variant='h4' component='h2'>Balanced</Typography>
              <p>(Higher spread of risk)</p>
            </CardContent>
          </CardActionArea>
        </Card>

        <Card className={classes.card}>
          <CardActionArea onClick={() => setPreferences({ risk: 2 })}>
            <CardContent className={classes.cardContent}>
              <AlarmOutlined color='primary' fontSize='large' />
              <Typography variant='h4' component='h2'>Aggressive</Typography>
              <p>Potentially high returns.</p>
            </CardContent>
          </CardActionArea>
        </Card>
      </div>
    </div>
  )
}
