import React from 'react';
import { Button } from '@material-ui/core';

export const BuyButton = (props) => {
  const { onClick } = props;

  return (
    <Button onClick={onClick} variant="contained" color="primary">Buy</Button>
  )
}
