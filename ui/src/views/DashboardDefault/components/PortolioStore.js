import { Button, Card, colors } from '@material-ui/core';
import React, { useContext } from 'react';

import { AppContext } from 'contexts/AppContext';

export function PortolioStore () {
  const { buy } = useContext(AppContext);
  
  const handleBuy = () => {
    console.log('buy')
  }

  return (
    <Card>
      Porfolio 1
      <Button onClick={handleBuy}>Buy</Button>
    </Card>
  )
}