import React, { Component, useState, useContext, useEffect } from 'react';
import { PieChart } from 'react-chartkick'
import 'chart.js'

import { AppContext } from '../../../contexts/AppContext';
import { BuyButton, ApproveButton } from './Widgets';
import { Card, CardActions, CardActionArea, CardContent, Typography, colors } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

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
  cardActions: {
    display: 'flex',
    justifyContent: 'center'
  },
  cardContent: {
    display: 'flex column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center'
  },
}))

const PortfolioDetails = props => {
  const classes = useStyles();
  const { id } = props;
  console.log('PortfolioDetails', props)
  const { web3 } = useContext(AppContext);
  const [distribution, setDistribution] = useState(null);
  const [balances, setbalances] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (web3) {
        const distribution = await web3.getTokenDistribution(id);
        console.log('distribution', distribution);
        setbalances(JSON.stringify(await web3.showBalance(id)));
        setDistribution(distribution);
      }
    }
    init();
  }, [web3]);

  return (
    <div className={classes.options}>
      <p>
        { balances }
      </p>
      <Card className={classes.card}>
          <CardContent className={classes.cardContent}>
            <Typography variant='h4' component='h2'>Portfolio #1</Typography>
            <div style={{ padding: 5, marginBottom: 5 }}></div>
            <Typography variant='h5' component='h5'>Distribution:</Typography>
            <PieChart data = {distribution} />
          </CardContent>
          <CardActions className={classes.cardActions} >
            <ApproveButton />
            <BuyButton id = {id} />
          </CardActions>
      </Card>
    </div>
  )
}

export default PortfolioDetails;
