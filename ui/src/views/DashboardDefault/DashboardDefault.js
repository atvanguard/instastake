import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Grid } from '@material-ui/core';

import { Page } from 'components';
import {
  Header,
  LatestProjects,
  NewProjects,
  RealTime,
  RoiPerCustomer,
  TeamTasks,
  TodaysMoney,
  SystemHealth,
  PerformanceOverTime
} from './components';

import PortfolioAllocation from './components/PortfolioAllocation'

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3)
  },
  container: {
    marginTop: theme.spacing(3)
  }
}));

const DashboardDefault = () => {
  const classes = useStyles();

  return (
    <Page
      className={classes.root}
      title="Default Dashboard"
    >
      <Header />
      <PortfolioAllocation />
    </Page>
  );
};

export default DashboardDefault;
