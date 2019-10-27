import React, { Component, useState, useContext, useEffect } from 'react';
import { PieChart } from 'react-chartkick'
import 'chart.js'

import { AppContext } from '../../../contexts/AppContext';

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
      {portfolios && portfolios.length ? (
        portfolios.map((tokenDistribution, index) => {
          return <PieChart data = {tokenDistribution} key={index} />
        })
      ) : (
        <PieChart data = {[ ['Blueberry', 44], ['Strawberry', 23] ]} />
      )}
    </div>
  )
}

export default PortfolioAllocation;
