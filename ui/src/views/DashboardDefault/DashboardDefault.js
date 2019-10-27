import React, { useEffect, useContext } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Page } from 'components';
import {
  Header,
  PortfolioAllocation,
  PortolioStore
} from './components';
import { AppContext } from '../../contexts/AppContext';
import { Onboarding } from './components/Onboarding';

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
  const { isOnboarding, portfolios } = useContext(AppContext);

  return (
    <Page
      className={classes.root}
      title="Default Dashboard"
    >
      <Header />
      {
        isOnboarding
          ? <Onboarding />
          : portfolios
            ? <PortfolioAllocation />
            : <PortolioStore />
      }
      
      
    </Page>
  );
};

export default DashboardDefault;
