import React, { useState, useContext } from 'react';

import { Card, CardActions, CardActionArea, CardContent, Typography, colors } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { AppContext } from 'contexts/AppContext';
import { PieChart } from 'react-chartkick'

import { BuyButton } from './Widgets';

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

export function PortolioStore () {
  const classes = useStyles();
  const { web3 } = useContext(AppContext);
  
  const handleBuy = () => {

  }

  return (
    <div className={classes.options}>
      <Card className={classes.card}>
          <CardContent className={classes.cardContent}>
            <Typography variant='h4' component='h2'>Portfolio #1</Typography>
            <div style={{ padding: 5, marginBottom: 5 }}></div>
            <Typography variant='h5' component='h5'>Distribution:</Typography>
            <PieChart data = {[['Matic', 50], ['Synthetix', 50]]} key={0} />
          </CardContent>
          <CardActions className={classes.cardActions} >
            <BuyButton onClick={() => handleBuy()}>Buy</BuyButton>
          </CardActions>
      </Card>
    </div>
  )
}