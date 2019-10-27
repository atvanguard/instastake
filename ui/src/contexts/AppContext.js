import React, { createContext, useEffect, useState } from 'react';

import Web3Client from './Web3Client'

export const AppContext = createContext({
  web3: null
})

export const AppContextConsumer = AppContext.Consumer;

export const AppContextProvider = (props) => {
  const { children } = props;

  let [web3, setWeb3] = useState(null);

  useEffect(() => {
    const initializeWeb3 = async () => {
      let _web3 = new Web3Client()
      await _web3.initialize()
      setWeb3(_web3);
    }

    initializeWeb3();
  }, []);

  return (
    <AppContext.Provider value={{web3}}>
      { children }
    </AppContext.Provider>
  )
}
