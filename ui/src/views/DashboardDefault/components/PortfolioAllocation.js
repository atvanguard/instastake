import React, { Component, useState, useContext, useEffect } from 'react';
import { PieChart } from 'react-chartkick'
import 'chart.js'

import { AppContext } from '../../../contexts/AppContext';

const PortfolioAllocation = props => {
  const { portfolios } = useContext(AppContext);

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
