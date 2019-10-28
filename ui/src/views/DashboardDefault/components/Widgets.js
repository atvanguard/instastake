import React, { Component, useState, useContext, useEffect } from 'react';
import { Button } from '@material-ui/core';
import { AppContext } from 'contexts/AppContext';

export const BuyButton = (props) => {
  const { id } = props;
  const { web3 } = useContext(AppContext);

  const handleBuy = async () => {
    console.log('in handleBuy')
    await web3.buy(id)
  }

  return (
    <Button onClick={handleBuy} variant="contained" color="primary">Buy</Button>
  )
}

export const ApproveButton = (props) => {
  // const { onClick } = props;
  const { web3 } = useContext(AppContext);

  const handleApprove = async () => {
    console.log('in handleApprove')
    await web3.approve()
  }

  return (
    <Button onClick={handleApprove} variant="contained" color="primary">Approve KNC</Button>
  )
}
