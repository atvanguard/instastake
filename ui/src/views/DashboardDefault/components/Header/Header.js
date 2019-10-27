import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import { Typography } from '@material-ui/core';
import { AppContext } from 'contexts/AppContext';

import { Preferences } from './Preferences';

const useStyles = makeStyles(theme => ({
  root: {},
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
  const { currentAccount } = useContext(AppContext);
  const classes = useStyles();

  return (
    <div
      {...rest}
      className={clsx(classes.root, className)}
    >
      <Typography
        component="h2"
        gutterBottom
        variant="overline"
      >
        Home
      </Typography>
      <Typography
        component="h1"
        gutterBottom
        variant="h3"
      >
        Happy Investing, {currentAccount}
      </Typography>
      <Preferences />
    </div>
  );
};

Header.propTypes = {
  className: PropTypes.string
};

Header.defaultProps = {};

export default Header;
