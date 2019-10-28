import React, { Component, useState, useContext, useEffect } from 'react';
import { PieChart } from 'react-chartkick'
import 'chart.js'

import { AppContext } from '../../../contexts/AppContext';
import { Typography } from '@material-ui/core';
import PortfolioDetails from './PortfolioDetails';

const PortfolioAllocation = props => {
  const { web3 } = useContext(AppContext);
  const [portfolios, setPortfolios] = useState(null);

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
    <div>
      <Typography variant='h2'>Your Allocations: </Typography>
      {portfolios && portfolios.length ? (
        portfolios.map((tokenDistribution, index) => {
          return <PortfolioDetails key={index} id={index} />
          // return <PieChart data = {tokenDistribution} key={index} />
        })
      ) : null
      }
    </div>
  )
}

export default PortfolioAllocation;
