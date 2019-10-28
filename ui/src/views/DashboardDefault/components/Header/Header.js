import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import { Card, CardContent, Typography,} from '@material-ui/core';
import { AppContext } from 'contexts/AppContext';

import { Preferences } from './Preferences';

const useStyles = makeStyles(theme => ({
  dates: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  startDateButton: {
    marginRight: theme.spacing(1)
  },
  endDateButton: {
    marginLeft: theme.spacing(1)
  },
  calendarTodayIcon: {
    marginRight: theme.spacing(1)
  }
}));

const Header = props => {
  const { className, ...rest } = props;
  const { currentAccount, isOnboarding, web3 } = useContext(AppContext);
  const classes = useStyles();

  // const [maticBalance, setMaticBalance] = useState();
  // const [synthetixBalance, setSynthetixBalance] = useState();

  useEffect(() => {
    // if (web3 && currentAccount) {
    //   const fetchBalances = async () => {
    //     console.log(web3);
    //     const _maticBalance = (await web3.maticInvestor.balanceOf(currentAccount)).toString()
    //     const _synthetixBalance = (await web3.synthetixInvestor.balanceOf(currentAccount)).toString();

    //     setMaticBalance(_maticBalance);
    //     setSynthetixBalance(_synthetixBalance);
    //   }

    //   fetchBalances();
    // }
  }, [currentAccount, web3]);

  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      <CardContent>
        <Typography
          component="h1"
          gutterBottom
          variant="h3"
        >
          Happy Investing, {currentAccount}
        </Typography>

        {
         !isOnboarding && <Preferences />}
      </CardContent>
    </Card>
  );
};

Header.propTypes = {
  className: PropTypes.string
};

Header.defaultProps = {};

export default Header;
