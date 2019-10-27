import React, { createContext, useEffect, useState } from 'react';

import Web3Client from '../contracts/Web3Client'

// export const AppContext = createContext({
//   isReady: false,
//   web3: null
// })

export const AppContext = createContext(null)

export const AppContextConsumer = AppContext.Consumer;

export const AppContextProvider = (props) => {
  const { children } = props;
  const [isReady, setIsReady] = useState(false);
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
