import React, { Component, useState, useContext, useEffect } from 'react';
import { PieChart } from 'react-chartkick'
import 'chart.js'

import { AppContext } from '../../../contexts/AppContext';

const PortfolioAllocation = props => {
  const { web3 } = useContext(AppContext);
  const [data, setData] = useState({ data: [] });

  useEffect(() => {
    const init = async () => {
      if (web3) {
        await web3.getPortfolios()
        // setData();
      }
      setData([ ['Blueberry', 44], ['Strawberry', 23] ]);
    }
    init();
  }, [web3]);

  return (
    <PieChart data = {data} />
  )
}

export default PortfolioAllocation;
