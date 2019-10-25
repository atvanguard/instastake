import React, { createContext, useEffect, useState } from 'react';

import InstaStake from './contracts/InstaStake.json'
import getWeb3 from './utils/getWeb3';

export const AppContext = createContext({
  accounts: null,
  contract: null,
  web3: null
})

export const AppContextConsumer = AppContext.Consumer;

export const AppContextProvider = (props) => {
  const { children } = props;
  const [accounts, setAccounts] = useState(null);
  const [contract, setContract] = useState(null);
  const [web3, setWeb3] = useState(null);

  useEffect(() => {
    const getWeb3Shit = async () => {
      const w3 = await getWeb3();
      // Use web3 to get the user's accounts.
      const accounts = await w3.eth.getAccounts();
      console.log('accounts => ', accounts);
      // Get the contract instance.
      const networkId = await w3.eth.net.getId();
      const deployedNetwork = InstaStake.networks[networkId];
      const instance = new w3.eth.Contract(
        InstaStake.abi,
        deployedNetwork && deployedNetwork.address,
      );
      console.log(instance);
      setWeb3(w3);
      setAccounts(accounts);
      setContract(instance);
    }

    getWeb3Shit();
  }, []);

  return (
    <AppContext.Provider value={{
      accounts,
      contract,
      web3
    }}>
      {children}
    </AppContext.Provider>
  )
}