import React, { useEffect, useContext, useState } from 'react';
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
  const { web3, isOnboarding } = useContext(AppContext);
  const [portfolios, setPortfolios] = useState(null);
  const [showPreferences, setShowPreferences] = useState(isOnboarding);

  useEffect(() => {
    const init = async () => {
      if (web3) {
        const portfolios = await web3.getPortfolios()
        console.log(portfolios)
        setPortfolios(portfolios);
      }
      // else {
      //   setPortfolios([[ ['Blueberry', 44], ['Strawberry', 23] ]]);
      // }
    }
    init();
  }, [web3]);


  return (
    <Page
      className={classes.root}
      title="Default Dashboard"
    >
      <Header />
      {
        showPreferences
          ? <Onboarding toggle={() => setShowPreferences(!showPreferences)} />
          : portfolios
            ? <PortfolioAllocation />
            : <PortolioStore />
      }
      
      
    </Page>
  );
};

export default DashboardDefault;
